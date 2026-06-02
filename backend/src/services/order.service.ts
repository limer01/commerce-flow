import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

// Orders are always returned with their line items (rendered from the
// snapshotted productName/priceAtPurchase — no join to Product needed).
const orderInclude = Prisma.validator<Prisma.OrderInclude>()({
  items: { orderBy: { id: 'asc' } },
});

export type OrderWithItems = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

// Places an order from the user's cart. Everything happens in one transaction
// so a failure (e.g. a concurrent checkout draining stock) leaves no partial
// writes. Stock is decremented with a CONDITIONAL updateMany — an affected
// count of 0 means someone else took the stock first, which rolls everything
// back. This is what prevents oversell under concurrency (a read-then-write
// would race).
export async function createOrder(userId: number): Promise<OrderWithItems> {
  return prisma.$transaction(async (tx) => {
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      throw new ApiError(400, 'Your cart is empty');
    }

    // Up-front re-validation gives a clean message before we write anything.
    for (const item of cart.items) {
      if (item.quantity > item.product.stockQuantity) {
        throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
      }
    }

    const totalPrice = cart.items.reduce(
      (sum, item) => sum.add(item.product.price.mul(item.quantity)),
      new Prisma.Decimal(0)
    );

    // Snapshot productName + priceAtPurchase so history is immutable.
    const order = await tx.order.create({
      data: {
        userId,
        totalPrice,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            quantity: item.quantity,
            priceAtPurchase: item.product.price,
          })),
        },
      },
      include: orderInclude,
    });

    // Concurrency-safe decrement: only succeeds while stock is still sufficient.
    for (const item of cart.items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, stockQuantity: { gte: item.quantity } },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      if (updated.count === 0) {
        throw new ApiError(400, `Insufficient stock for ${item.product.name}`);
      }
    }

    // Empty the cart (items first, then the cart row itself).
    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.delete({ where: { id: cart.id } });

    return order;
  });
}

// The current user's order history, newest first, rendered from snapshots.
export async function getOrders(userId: number): Promise<OrderWithItems[]> {
  return prisma.order.findMany({
    where: { userId },
    include: orderInclude,
    orderBy: { createdAt: 'desc' },
  });
}

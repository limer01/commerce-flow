import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

// Every cart response joins items to their product (name/price/imageUrl), in a
// stable insertion order.
const cartInclude = Prisma.validator<Prisma.CartInclude>()({
  items: {
    include: { product: true },
    orderBy: { createdAt: 'asc' },
  },
});

export type CartWithItems = Prisma.CartGetPayload<{ include: typeof cartInclude }>;

// Returns the user's cart, lazily creating an empty one the first time.
export async function getOrCreateCart(userId: number): Promise<CartWithItems> {
  const existing = await prisma.cart.findUnique({
    where: { userId },
    include: cartInclude,
  });
  if (existing) return existing;

  return prisma.cart.create({ data: { userId }, include: cartInclude });
}

// Adds a product to the cart, incrementing quantity if it's already present
// (one row per product per cart, enforced by the @@unique([cartId, productId])).
export async function addItem(
  userId: number,
  productId: number,
  quantity = 1
): Promise<CartWithItems> {
  const qty = Number.isInteger(quantity) && quantity > 0 ? quantity : 1;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  if (product.stockQuantity < 1) {
    throw new ApiError(400, 'Product is out of stock');
  }

  const cart = await getOrCreateCart(userId);

  await prisma.cartItem.upsert({
    where: { cartId_productId: { cartId: cart.id, productId } },
    create: { cartId: cart.id, productId, quantity: qty },
    update: { quantity: { increment: qty } },
  });

  return getOrCreateCart(userId);
}

// Looks up a cart item scoped to the requesting user's own cart. Returns null
// when there's no match — which is how cross-user access (IDOR) becomes a 404:
// authentication proves identity, not ownership.
async function findOwnedItem(userId: number, itemId: number) {
  return prisma.cartItem.findFirst({ where: { id: itemId, cart: { userId } } });
}

// Sets an item's quantity. A quantity of 0 or less deletes the item.
export async function updateItem(
  userId: number,
  itemId: number,
  quantity: number
): Promise<CartWithItems> {
  const item = await findOwnedItem(userId, itemId);
  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: item.id } });
  } else {
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
  }

  return getOrCreateCart(userId);
}

// Removes an item from the cart (ownership-scoped, 404 otherwise).
export async function removeItem(userId: number, itemId: number): Promise<CartWithItems> {
  const item = await findOwnedItem(userId, itemId);
  if (!item) {
    throw new ApiError(404, 'Cart item not found');
  }

  await prisma.cartItem.delete({ where: { id: item.id } });
  return getOrCreateCart(userId);
}

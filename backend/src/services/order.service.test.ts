import { createOrder, getOrders } from './order.service';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../lib/prisma';
import { resetDb, createUser, createProduct } from '../test/helpers';

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

// Builds a persisted cart with the given line items directly, so each test can
// set exact quantities (including over-stock amounts the cart service allows).
async function giveCart(
  userId: number,
  items: Array<{ productId: number; quantity: number }>
) {
  const cart = await prisma.cart.create({ data: { userId } });
  for (const item of items) {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId: item.productId, quantity: item.quantity },
    });
  }
  return cart;
}

describe('order.service: createOrder — happy path', () => {
  it('creates a PENDING order with snapshotted items and the correct total', async () => {
    const user = await createUser();
    const a = await createProduct({ name: 'Hoodie', price: '10.00', stockQuantity: 10 });
    const b = await createProduct({ name: 'Tee', price: '5.50', stockQuantity: 10 });
    await giveCart(user.id, [
      { productId: a.id, quantity: 2 },
      { productId: b.id, quantity: 1 },
    ]);

    const order = await createOrder(user.id);

    expect(order.status).toBe('PENDING');
    expect(order.items).toHaveLength(2);
    expect(Number(order.totalPrice)).toBeCloseTo(25.5); // 2*10 + 1*5.5

    const hoodie = order.items.find((i) => i.productName === 'Hoodie');
    expect(hoodie).toMatchObject({ productId: a.id, quantity: 2 });
    expect(Number(hoodie!.priceAtPurchase)).toBe(10);
  });

  it('decrements stock by the ordered quantity for each item', async () => {
    const user = await createUser();
    const a = await createProduct({ price: '10.00', stockQuantity: 10 });
    const b = await createProduct({ price: '5.00', stockQuantity: 3 });
    await giveCart(user.id, [
      { productId: a.id, quantity: 2 },
      { productId: b.id, quantity: 1 },
    ]);

    await createOrder(user.id);

    expect((await prisma.product.findUniqueOrThrow({ where: { id: a.id } })).stockQuantity).toBe(8);
    expect((await prisma.product.findUniqueOrThrow({ where: { id: b.id } })).stockQuantity).toBe(2);
  });

  it('clears the cart (items and cart row) after a successful order', async () => {
    const user = await createUser();
    const a = await createProduct({ stockQuantity: 10 });
    await giveCart(user.id, [{ productId: a.id, quantity: 1 }]);

    await createOrder(user.id);

    expect(await prisma.cart.findUnique({ where: { userId: user.id } })).toBeNull();
    expect(await prisma.cartItem.count()).toBe(0);
  });
});

describe('order.service: createOrder — snapshot independence', () => {
  it('keeps the price/name paid even after the product is later changed', async () => {
    const user = await createUser();
    const a = await createProduct({ name: 'Original', price: '10.00', stockQuantity: 10 });
    await giveCart(user.id, [{ productId: a.id, quantity: 1 }]);

    await createOrder(user.id);
    await prisma.product.update({
      where: { id: a.id },
      data: { name: 'Renamed', price: '999.00' },
    });

    const [order] = await getOrders(user.id);
    expect(order.items[0].productName).toBe('Original');
    expect(Number(order.items[0].priceAtPurchase)).toBe(10);
  });

  it('still renders order history after the product is deleted (productId null, order intact)', async () => {
    const user = await createUser();
    const a = await createProduct({ name: 'Gone', price: '12.00', stockQuantity: 10 });
    await giveCart(user.id, [{ productId: a.id, quantity: 2 }]);

    await createOrder(user.id);
    await prisma.product.delete({ where: { id: a.id } });

    const [order] = await getOrders(user.id);
    expect(order.items).toHaveLength(1);
    expect(order.items[0].productId).toBeNull(); // FK set null
    expect(order.items[0].productName).toBe('Gone'); // snapshot survives
    expect(Number(order.items[0].priceAtPurchase)).toBe(12);
    expect(Number(order.totalPrice)).toBeCloseTo(24);
  });
});

describe('order.service: createOrder — stock guard & atomicity', () => {
  it('rejects an order requesting more than available stock with no partial writes', async () => {
    const user = await createUser();
    const p = await createProduct({ name: 'Scarce', stockQuantity: 3 });
    await giveCart(user.id, [{ productId: p.id, quantity: 5 }]); // 5 > 3

    await expect(createOrder(user.id)).rejects.toMatchObject({ statusCode: 400 });

    // Nothing was written, nothing was decremented, the cart is intact.
    expect(await prisma.order.count()).toBe(0);
    expect(await prisma.orderItem.count()).toBe(0);
    expect((await prisma.product.findUniqueOrThrow({ where: { id: p.id } })).stockQuantity).toBe(3);
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });
    expect(cart?.items).toHaveLength(1);
  });

  it('rolls back the entire transaction if any single item is short on stock', async () => {
    const user = await createUser();
    const ok = await createProduct({ name: 'Plenty', stockQuantity: 10 });
    const short = await createProduct({ name: 'OneLeft', stockQuantity: 1 });
    await giveCart(user.id, [
      { productId: ok.id, quantity: 2 }, // fine on its own
      { productId: short.id, quantity: 5 }, // forces rollback
    ]);

    await expect(createOrder(user.id)).rejects.toBeInstanceOf(ApiError);

    // The in-stock item's quantity must NOT have been decremented.
    expect((await prisma.product.findUniqueOrThrow({ where: { id: ok.id } })).stockQuantity).toBe(10);
    expect((await prisma.product.findUniqueOrThrow({ where: { id: short.id } })).stockQuantity).toBe(1);
    expect(await prisma.order.count()).toBe(0);
    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: { items: true },
    });
    expect(cart?.items).toHaveLength(2);
  });

  it('rejects checkout when the cart is empty', async () => {
    const user = await createUser();

    await expect(createOrder(user.id)).rejects.toMatchObject({ statusCode: 400 });
  });
});

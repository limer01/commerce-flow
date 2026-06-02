import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';

const app = createApp();

const suffix = Date.now();
const user = { name: 'Order U', email: `order-${suffix}@test.com`, password: 'password123' };

let agent: ReturnType<typeof request.agent>;
let prodA: number; // stock 10, price 10.00
let prodB: number; // stock 2,  price 5.50

const baseProduct = {
  description: 'order test',
  imageUrl: '/images/order-test.jpg',
  category: 'Tees',
};

beforeAll(async () => {
  const a = await prisma.product.create({
    data: { ...baseProduct, name: `Order Test A ${suffix}`, price: '10.00', stockQuantity: 10 },
  });
  const b = await prisma.product.create({
    data: { ...baseProduct, name: `Order Test B ${suffix}`, price: '5.50', stockQuantity: 2 },
  });
  prodA = a.id;
  prodB = b.id;

  agent = request.agent(app);
  await agent.post('/auth/register').send(user).expect(201);
});

beforeEach(async () => {
  // Reset everything this user touched so tests don't depend on ordering.
  await prisma.order.deleteMany({ where: { user: { email: user.email } } });
  await prisma.cart.deleteMany({ where: { user: { email: user.email } } });
  await prisma.product.update({ where: { id: prodA }, data: { stockQuantity: 10, price: '10.00' } });
  await prisma.product.update({ where: { id: prodB }, data: { stockQuantity: 2, price: '5.50' } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: user.email } });
  await prisma.product.deleteMany({ where: { name: { startsWith: 'Order Test ' } } });
  await prisma.$disconnect();
});

describe('order auth', () => {
  it('returns 401 for unauthenticated order requests', async () => {
    await request(app).post('/orders').expect(401);
    await request(app).get('/orders').expect(401);
  });
});

describe('POST /orders', () => {
  it('creates a PENDING order with snapshotted line items and correct total', async () => {
    await agent.post('/cart/items').send({ productId: prodA, quantity: 2 }).expect(201);
    await agent.post('/cart/items').send({ productId: prodB, quantity: 1 }).expect(201);

    const res = await agent.post('/orders').expect(201);

    expect(res.body.status).toBe('PENDING');
    expect(Number(res.body.totalPrice)).toBeCloseTo(25.5); // 2*10 + 1*5.50
    expect(res.body.items).toHaveLength(2);
    const itemA = res.body.items.find((i: { productName: string }) =>
      i.productName.includes('Order Test A')
    );
    expect(itemA.quantity).toBe(2);
    expect(Number(itemA.priceAtPurchase)).toBeCloseTo(10);
  });

  it('decrements product stock via the order', async () => {
    await agent.post('/cart/items').send({ productId: prodA, quantity: 3 }).expect(201);
    await agent.post('/orders').expect(201);

    const p = await prisma.product.findUnique({ where: { id: prodA } });
    expect(p?.stockQuantity).toBe(7); // 10 - 3
  });

  it('clears the cart after a successful order', async () => {
    await agent.post('/cart/items').send({ productId: prodA, quantity: 1 }).expect(201);
    await agent.post('/orders').expect(201);

    const cart = (await agent.get('/cart')).body;
    expect(cart.items).toHaveLength(0);
  });

  it('returns 400 on insufficient stock with no partial writes', async () => {
    // Cart allows adding more than stock; checkout must re-validate and reject.
    await agent.post('/cart/items').send({ productId: prodB, quantity: 5 }).expect(201); // stock is 2

    const res = await agent.post('/orders').expect(400);
    expect(res.body.error).toMatch(/stock/i);

    // No order was written and stock is untouched (transaction rolled back).
    const orders = (await agent.get('/orders')).body;
    expect(orders).toHaveLength(0);
    const p = await prisma.product.findUnique({ where: { id: prodB } });
    expect(p?.stockQuantity).toBe(2);
  });

  it('snapshots priceAtPurchase — later price changes do not affect history', async () => {
    await agent.post('/cart/items').send({ productId: prodA, quantity: 1 }).expect(201);
    await agent.post('/orders').expect(201);

    await prisma.product.update({ where: { id: prodA }, data: { price: '999.00' } });

    const orders = (await agent.get('/orders')).body;
    const item = orders[0].items[0];
    expect(Number(item.priceAtPurchase)).toBeCloseTo(10); // paid price, not 999
  });
});

describe('GET /orders', () => {
  it('returns orders newest-first', async () => {
    await agent.post('/cart/items').send({ productId: prodA, quantity: 1 }).expect(201);
    await agent.post('/orders').expect(201);
    await agent.post('/cart/items').send({ productId: prodB, quantity: 1 }).expect(201);
    await agent.post('/orders').expect(201);

    const orders = (await agent.get('/orders')).body;
    expect(orders).toHaveLength(2);
    expect(new Date(orders[0].createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(orders[1].createdAt).getTime()
    );
  });

  it('still renders history after the underlying product is deleted (SetNull snapshot)', async () => {
    const tmp = await prisma.product.create({
      data: { ...baseProduct, name: `Order Test Tmp ${suffix}`, price: '7.77', stockQuantity: 5 },
    });
    await agent.post('/cart/items').send({ productId: tmp.id, quantity: 1 }).expect(201);
    await agent.post('/orders').expect(201);

    await prisma.product.delete({ where: { id: tmp.id } });

    const orders = (await agent.get('/orders')).body;
    const item = orders[0].items[0];
    expect(item.productId).toBeNull(); // SetNull on product delete
    expect(item.productName).toContain('Order Test Tmp');
    expect(Number(item.priceAtPurchase)).toBeCloseTo(7.77);
  });
});

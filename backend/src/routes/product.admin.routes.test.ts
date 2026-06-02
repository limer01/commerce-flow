import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';
import { signToken } from '../utils/jwt';

const app = createApp();
const suffix = Date.now();

let adminCookie: string;
let customerCookie: string;
let customerId: number;

// Build a unique-named product payload (name is unique in the schema).
const sample = (over: Record<string, unknown> = {}) => ({
  name: `Admin Prod ${suffix} ${Math.random().toString(36).slice(2, 8)}`,
  description: 'an admin-managed product',
  price: '49.99',
  imageUrl: '/images/admin-test.jpg',
  category: 'Tees',
  stockQuantity: 5,
  ...over,
});

beforeAll(async () => {
  // Real users (so FK-bound cart/order tests work); cookies are crafted tokens
  // — the authenticate middleware trusts the token, no login round-trip needed.
  const admin = await prisma.user.create({
    data: { name: 'Admin', email: `admin-prod-${suffix}@test.com`, passwordHash: 'x', role: 'ADMIN' },
  });
  const customer = await prisma.user.create({
    data: { name: 'Cust', email: `cust-prod-${suffix}@test.com`, passwordHash: 'x', role: 'CUSTOMER' },
  });
  customerId = customer.id;
  adminCookie = `token=${signToken({ userId: admin.id, role: 'ADMIN' })}`;
  customerCookie = `token=${signToken({ userId: customer.id, role: 'CUSTOMER' })}`;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [`admin-prod-${suffix}@test.com`, `cust-prod-${suffix}@test.com`] } },
  });
  await prisma.product.deleteMany({ where: { name: { startsWith: `Admin Prod ${suffix}` } } });
  await prisma.$disconnect();
});

describe('admin product auth', () => {
  it('returns 401 for unauthenticated mutation requests', async () => {
    await request(app).post('/products').send(sample()).expect(401);
    await request(app).put('/products/1').send({ name: 'x' }).expect(401);
    await request(app).delete('/products/1').expect(401);
  });

  it('returns 403 for authenticated non-admin users', async () => {
    await request(app).post('/products').set('Cookie', customerCookie).send(sample()).expect(403);
    await request(app).put('/products/1').set('Cookie', customerCookie).send({ name: 'x' }).expect(403);
    await request(app).delete('/products/1').set('Cookie', customerCookie).expect(403);
  });
});

describe('POST /products (admin)', () => {
  it('creates a product and returns it', async () => {
    const data = sample();
    const res = await request(app).post('/products').set('Cookie', adminCookie).send(data).expect(201);
    expect(res.body.id).toBeDefined();
    expect(res.body).toMatchObject({ name: data.name, category: 'Tees', stockQuantity: 5 });
  });

  it('returns 400 when required fields are missing', async () => {
    await request(app).post('/products').set('Cookie', adminCookie).send({ name: 'only a name' }).expect(400);
  });
});

describe('PUT /products/:id (admin)', () => {
  it('updates a product and returns the updated record', async () => {
    const created = await request(app).post('/products').set('Cookie', adminCookie).send(sample()).expect(201);
    const res = await request(app)
      .put(`/products/${created.body.id}`)
      .set('Cookie', adminCookie)
      .send({ stockQuantity: 99, price: '12.34' })
      .expect(200);
    expect(res.body.stockQuantity).toBe(99);
    expect(Number(res.body.price)).toBeCloseTo(12.34);
  });
});

describe('DELETE /products/:id (admin)', () => {
  it('deletes the product', async () => {
    const created = await request(app).post('/products').set('Cookie', adminCookie).send(sample()).expect(201);
    await request(app).delete(`/products/${created.body.id}`).set('Cookie', adminCookie).expect(204);
    await request(app).get(`/products/${created.body.id}`).expect(404);
  });

  it('leaves past orders intact when the product is deleted (OrderItem SetNull)', async () => {
    const created = await request(app)
      .post('/products')
      .set('Cookie', adminCookie)
      .send(sample({ stockQuantity: 10 }))
      .expect(201);
    const pid = created.body.id;

    const order = await prisma.order.create({
      data: {
        userId: customerId,
        totalPrice: '49.99',
        items: {
          create: [
            { productId: pid, productName: created.body.name, quantity: 1, priceAtPurchase: '49.99' },
          ],
        },
      },
    });

    await request(app).delete(`/products/${pid}`).set('Cookie', adminCookie).expect(204);

    const items = await prisma.orderItem.findMany({ where: { orderId: order.id } });
    expect(items).toHaveLength(1);
    expect(items[0].productId).toBeNull(); // SetNull
    expect(items[0].productName).toBe(created.body.name); // snapshot intact
    expect(Number(items[0].priceAtPurchase)).toBeCloseTo(49.99);

    await prisma.order.delete({ where: { id: order.id } });
  });

  it('removes the product from active carts (CartItem cascade)', async () => {
    const created = await request(app)
      .post('/products')
      .set('Cookie', adminCookie)
      .send(sample({ stockQuantity: 10 }))
      .expect(201);
    const pid = created.body.id;

    const cart = await prisma.cart.create({
      data: { userId: customerId, items: { create: [{ productId: pid, quantity: 2 }] } },
    });

    await request(app).delete(`/products/${pid}`).set('Cookie', adminCookie).expect(204);

    const items = await prisma.cartItem.findMany({ where: { cartId: cart.id } });
    expect(items).toHaveLength(0); // cascade removed the line

    await prisma.cart.delete({ where: { id: cart.id } });
  });
});

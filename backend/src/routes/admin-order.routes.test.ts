import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';
import { signToken } from '../utils/jwt';

const app = createApp();
const suffix = Date.now();

let adminCookie: string;
let customerCookie: string;
let customerOrderId: number;

beforeAll(async () => {
  const admin = await prisma.user.create({
    data: { name: 'Admin O', email: `admin-ord-${suffix}@test.com`, passwordHash: 'x', role: 'ADMIN' },
  });
  const customer = await prisma.user.create({
    data: { name: 'Cust O', email: `cust-ord-${suffix}@test.com`, passwordHash: 'x', role: 'CUSTOMER' },
  });
  adminCookie = `token=${signToken({ userId: admin.id, role: 'ADMIN' })}`;
  customerCookie = `token=${signToken({ userId: customer.id, role: 'CUSTOMER' })}`;

  const product = await prisma.product.create({
    data: {
      name: `Admin Order Test ${suffix}`,
      description: 'x',
      price: '10.00',
      imageUrl: '/i.jpg',
      category: 'Tees',
      stockQuantity: 10,
    },
  });

  const order = await prisma.order.create({
    data: {
      userId: customer.id,
      totalPrice: '20.00',
      items: {
        create: [
          { productId: product.id, productName: product.name, quantity: 2, priceAtPurchase: '10.00' },
        ],
      },
    },
  });
  customerOrderId = order.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({
    where: { email: { in: [`admin-ord-${suffix}@test.com`, `cust-ord-${suffix}@test.com`] } },
  });
  await prisma.product.deleteMany({ where: { name: { startsWith: 'Admin Order Test ' } } });
  await prisma.$disconnect();
});

describe('GET /admin/orders', () => {
  it('returns all orders for an admin', async () => {
    const res = await request(app).get('/admin/orders').set('Cookie', adminCookie).expect(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((o: { id: number }) => o.id === customerOrderId)).toBe(true);
  });

  it('returns 401 for unauthenticated requests', async () => {
    await request(app).get('/admin/orders').expect(401);
  });

  it('returns 403 for authenticated non-admin users', async () => {
    await request(app).get('/admin/orders').set('Cookie', customerCookie).expect(403);
  });

  it('includes customer name/email (but not passwordHash) and items, newest first', async () => {
    const res = await request(app).get('/admin/orders').set('Cookie', adminCookie).expect(200);

    const order = res.body.find((o: { id: number }) => o.id === customerOrderId);
    expect(order.user).toMatchObject({ name: expect.any(String), email: expect.any(String) });
    expect(order.user.passwordHash).toBeUndefined(); // never leak the hash
    expect(order.items.length).toBeGreaterThanOrEqual(1);
    expect(order.items[0].productName).toContain('Admin Order Test');

    // newest-first: createdAt must be non-increasing across the list
    for (let i = 1; i < res.body.length; i += 1) {
      expect(new Date(res.body[i - 1].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(res.body[i].createdAt).getTime()
      );
    }
  });
});

describe('PUT /admin/orders/:id', () => {
  it('updates an order status to COMPLETED', async () => {
    const res = await request(app)
      .put(`/admin/orders/${customerOrderId}`)
      .set('Cookie', adminCookie)
      .send({ status: 'COMPLETED' })
      .expect(200);
    expect(res.body.status).toBe('COMPLETED');
  });

  it('returns 404 for a non-existent order', async () => {
    await request(app)
      .put('/admin/orders/99999999')
      .set('Cookie', adminCookie)
      .send({ status: 'COMPLETED' })
      .expect(404);
  });

  it('returns 403 for non-admins and 401 when unauthenticated', async () => {
    await request(app)
      .put(`/admin/orders/${customerOrderId}`)
      .set('Cookie', customerCookie)
      .send({ status: 'COMPLETED' })
      .expect(403);
    await request(app)
      .put(`/admin/orders/${customerOrderId}`)
      .send({ status: 'COMPLETED' })
      .expect(401);
  });
});

import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';

const app = createApp();

const sampleProducts = [
  {
    name: 'Test Hoodie 1',
    description: 'A great hoodie',
    price: '89.99',
    imageUrl: '/images/hoodie-1.jpg',
    category: 'Hoodies',
    stockQuantity: 10,
  },
  {
    name: 'Test Hoodie 2',
    description: 'Another hoodie',
    price: '95.00',
    imageUrl: '/images/hoodie-2.jpg',
    category: 'Hoodies',
    stockQuantity: 0,
  },
  {
    name: 'Test Tee 1',
    description: 'A plain tee',
    price: '39.99',
    imageUrl: '/images/tee-1.jpg',
    category: 'Tees',
    stockQuantity: 5,
  },
];

beforeEach(async () => {
  await prisma.product.deleteMany({ where: { name: { startsWith: 'Test ' } } });
  await prisma.product.createMany({ data: sampleProducts });
});

afterAll(async () => {
  await prisma.product.deleteMany({ where: { name: { startsWith: 'Test ' } } });
  await prisma.$disconnect();
});

describe('GET /products', () => {
  it('returns all products as a JSON array', async () => {
    const res = await request(app).get('/products');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(3);
    expect(res.body[0]).toMatchObject({ name: expect.any(String), category: expect.any(String) });
  });

  it('filters by category when ?category= is provided', async () => {
    const res = await request(app).get('/products?category=Hoodies');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);
    res.body.forEach((p: { category: string }) => {
      expect(p.category).toBe('Hoodies');
    });
  });
});

describe('GET /products/:id', () => {
  it('returns a single product by id', async () => {
    const product = await prisma.product.findFirst({ where: { name: 'Test Tee 1' } });

    const res = await request(app).get(`/products/${product!.id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ name: 'Test Tee 1', category: 'Tees' });
  });

  it('returns 404 for an unknown product id', async () => {
    const res = await request(app).get('/products/999999');

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
  });

  it('returns 400 for a non-numeric product id', async () => {
    const res = await request(app).get('/products/not-a-number');

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });
});

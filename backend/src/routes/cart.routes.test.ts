import request from 'supertest';
import { createApp } from '../app';
import { prisma } from '../lib/prisma';

const app = createApp();

// Unique suffix so repeated runs don't collide on unique email / product name.
const suffix = Date.now();
const userA = { name: 'Cart A', email: `cart-a-${suffix}@test.com`, password: 'password123' };
const userB = { name: 'Cart B', email: `cart-b-${suffix}@test.com`, password: 'password123' };

let agentA: ReturnType<typeof request.agent>;
let agentB: ReturnType<typeof request.agent>;
let inStockId: number;
let outOfStockId: number;

beforeAll(async () => {
  const inStock = await prisma.product.create({
    data: {
      name: `Cart Test InStock ${suffix}`,
      description: 'in stock',
      price: '10.00',
      imageUrl: '/images/cart-test-1.jpg',
      category: 'Tees',
      stockQuantity: 5,
    },
  });
  const oos = await prisma.product.create({
    data: {
      name: `Cart Test OOS ${suffix}`,
      description: 'out of stock',
      price: '20.00',
      imageUrl: '/images/cart-test-2.jpg',
      category: 'Tees',
      stockQuantity: 0,
    },
  });
  inStockId = inStock.id;
  outOfStockId = oos.id;

  agentA = request.agent(app);
  await agentA.post('/auth/register').send(userA).expect(201);
  agentB = request.agent(app);
  await agentB.post('/auth/register').send(userB).expect(201);
});

beforeEach(async () => {
  // Reset both users' carts so each test is independent of ordering.
  await prisma.cartItem.deleteMany({
    where: { cart: { user: { email: { in: [userA.email, userB.email] } } } },
  });
});

afterAll(async () => {
  // Cascades remove each user's cart + items; then drop the test products.
  await prisma.user.deleteMany({ where: { email: { in: [userA.email, userB.email] } } });
  await prisma.product.deleteMany({ where: { name: { startsWith: 'Cart Test ' } } });
  await prisma.$disconnect();
});

describe('cart auth', () => {
  it('returns 401 for unauthenticated requests to every cart route', async () => {
    await request(app).get('/cart').expect(401);
    await request(app).post('/cart/items').send({ productId: inStockId }).expect(401);
    await request(app).put('/cart/items/1').send({ quantity: 2 }).expect(401);
    await request(app).delete('/cart/items/1').expect(401);
  });
});

describe('POST /cart/items', () => {
  it('adds a product to the cart for a logged-in user', async () => {
    const res = await agentA.post('/cart/items').send({ productId: inStockId }).expect(201);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].productId).toBe(inStockId);
    expect(res.body.items[0].quantity).toBe(1);
  });

  it('increments quantity instead of duplicating when the product is already in the cart', async () => {
    await agentA.post('/cart/items').send({ productId: inStockId }).expect(201);
    const res = await agentA.post('/cart/items').send({ productId: inStockId }).expect(201);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].quantity).toBe(2);
  });

  it('returns 400 when the product is out of stock', async () => {
    await agentA.post('/cart/items').send({ productId: outOfStockId }).expect(400);
  });
});

describe('PUT /cart/items/:id', () => {
  it('sets the quantity to the given value', async () => {
    await agentA.post('/cart/items').send({ productId: inStockId }).expect(201);
    const itemId = (await agentA.get('/cart')).body.items[0].id;

    const res = await agentA.put(`/cart/items/${itemId}`).send({ quantity: 4 }).expect(200);
    expect(res.body.items[0].quantity).toBe(4);
  });

  it('deletes the item when quantity is 0 or below', async () => {
    await agentA.post('/cart/items').send({ productId: inStockId }).expect(201);
    const itemId = (await agentA.get('/cart')).body.items[0].id;

    const res = await agentA.put(`/cart/items/${itemId}`).send({ quantity: 0 }).expect(200);
    expect(res.body.items).toHaveLength(0);
  });
});

describe('DELETE /cart/items/:id', () => {
  it('removes the item from the cart', async () => {
    await agentA.post('/cart/items').send({ productId: inStockId }).expect(201);
    const itemId = (await agentA.get('/cart')).body.items[0].id;

    const res = await agentA.delete(`/cart/items/${itemId}`).expect(200);
    expect(res.body.items).toHaveLength(0);
  });
});

describe('ownership scoping (IDOR prevention)', () => {
  it('returns 404 when a user tries to mutate or delete another user\'s cart item', async () => {
    // User A adds an item.
    await agentA.post('/cart/items').send({ productId: inStockId }).expect(201);
    const aItemId = (await agentA.get('/cart')).body.items[0].id;

    // User B must not be able to touch it.
    await agentB.put(`/cart/items/${aItemId}`).send({ quantity: 99 }).expect(404);
    await agentB.delete(`/cart/items/${aItemId}`).expect(404);

    // A's item is unchanged.
    const aCart = (await agentA.get('/cart')).body;
    expect(aCart.items).toHaveLength(1);
    expect(aCart.items[0].quantity).toBe(1);
  });
});

describe('GET /cart', () => {
  it('returns cart items joined with product name, price and image', async () => {
    await agentA.post('/cart/items').send({ productId: inStockId }).expect(201);

    const res = await agentA.get('/cart').expect(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].product).toMatchObject({
      name: expect.any(String),
      price: expect.any(String),
      imageUrl: expect.any(String),
    });
  });
});

import { addItem, updateItem, removeItem, getOrCreateCart } from './cart.service';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../lib/prisma';
import { resetDb, createUser, createProduct } from '../test/helpers';

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('cart.service: addItem', () => {
  it('creates a new cart item for a product not yet in the cart', async () => {
    const user = await createUser();
    const product = await createProduct({ stockQuantity: 10 });

    const cart = await addItem(user.id, product.id, 2);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0]).toMatchObject({ productId: product.id, quantity: 2 });
  });

  it('increments quantity (upsert) instead of creating a duplicate row', async () => {
    const user = await createUser();
    const product = await createProduct({ stockQuantity: 10 });

    await addItem(user.id, product.id, 1);
    const cart = await addItem(user.id, product.id, 2);

    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
    expect(await prisma.cartItem.count()).toBe(1);
  });

  it('rejects adding an out-of-stock product with a 400', async () => {
    const user = await createUser();
    const product = await createProduct({ stockQuantity: 0 });

    await expect(addItem(user.id, product.id, 1)).rejects.toBeInstanceOf(ApiError);
    await expect(addItem(user.id, product.id, 1)).rejects.toMatchObject({ statusCode: 400 });
    expect(await prisma.cartItem.count()).toBe(0);
  });

  it('throws a 404 when the product does not exist', async () => {
    const user = await createUser();

    await expect(addItem(user.id, 999999, 1)).rejects.toMatchObject({ statusCode: 404 });
  });
});

describe('cart.service: updateItem', () => {
  it('deletes the item when quantity is set to 0', async () => {
    const user = await createUser();
    const product = await createProduct({ stockQuantity: 10 });
    await addItem(user.id, product.id, 2);
    const owned = await getOrCreateCart(user.id);
    const itemId = owned.items[0].id;

    const cart = await updateItem(user.id, itemId, 0);

    expect(cart.items).toHaveLength(0);
    expect(await prisma.cartItem.count()).toBe(0);
  });

  it('updates the quantity for a positive value', async () => {
    const user = await createUser();
    const product = await createProduct({ stockQuantity: 10 });
    await addItem(user.id, product.id, 2);
    const owned = await getOrCreateCart(user.id);

    const cart = await updateItem(user.id, owned.items[0].id, 5);

    expect(cart.items[0].quantity).toBe(5);
  });
});

describe('cart.service: ownership scoping (IDOR)', () => {
  it('returns 404 when updating an item that belongs to another user', async () => {
    const owner = await createUser();
    const attacker = await createUser();
    const product = await createProduct({ stockQuantity: 10 });
    await addItem(owner.id, product.id, 1);
    const ownerCart = await getOrCreateCart(owner.id);
    const itemId = ownerCart.items[0].id;

    await expect(updateItem(attacker.id, itemId, 99)).rejects.toMatchObject({
      statusCode: 404,
    });

    // The owner's item is untouched.
    const after = await getOrCreateCart(owner.id);
    expect(after.items[0].quantity).toBe(1);
  });

  it('returns 404 when deleting an item that belongs to another user', async () => {
    const owner = await createUser();
    const attacker = await createUser();
    const product = await createProduct({ stockQuantity: 10 });
    await addItem(owner.id, product.id, 1);
    const ownerCart = await getOrCreateCart(owner.id);
    const itemId = ownerCart.items[0].id;

    await expect(removeItem(attacker.id, itemId)).rejects.toMatchObject({
      statusCode: 404,
    });

    expect(await prisma.cartItem.count()).toBe(1);
  });
});

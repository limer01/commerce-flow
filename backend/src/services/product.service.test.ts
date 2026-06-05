import { getProducts, getProductById } from './product.service';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../lib/prisma';
import { resetDb, createProduct } from '../test/helpers';

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('product.service: getProducts', () => {
  it('returns all products when no filter is given', async () => {
    await createProduct({ category: 'Hoodies' });
    await createProduct({ category: 'Tees' });
    await createProduct({ category: 'Caps' });

    const products = await getProducts();

    expect(products).toHaveLength(3);
  });

  it('returns only products in the requested category', async () => {
    await createProduct({ name: 'Hoodie A', category: 'Hoodies' });
    await createProduct({ name: 'Hoodie B', category: 'Hoodies' });
    await createProduct({ name: 'Tee A', category: 'Tees' });

    const hoodies = await getProducts('Hoodies');

    expect(hoodies).toHaveLength(2);
    expect(hoodies.every((p) => p.category === 'Hoodies')).toBe(true);
  });

  it('returns an empty array when a category has no products', async () => {
    await createProduct({ category: 'Tees' });

    expect(await getProducts('Bags')).toEqual([]);
  });
});

describe('product.service: getProductById', () => {
  it('returns the product for a valid id', async () => {
    const created = await createProduct({ name: 'Specific Tee' });

    const found = await getProductById(created.id);

    expect(found).toMatchObject({ id: created.id, name: 'Specific Tee' });
  });

  it('throws a 404 ApiError for an unknown id', async () => {
    await expect(getProductById(999999)).rejects.toBeInstanceOf(ApiError);
    await expect(getProductById(999999)).rejects.toMatchObject({ statusCode: 404 });
  });
});

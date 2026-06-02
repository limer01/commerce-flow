import type { Product } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { ApiError } from '../utils/ApiError';

export type { Product };

export async function getProducts(category?: string): Promise<Product[]> {
  return prisma.product.findMany({
    where: category ? { category } : undefined,
    orderBy: { createdAt: 'asc' },
  });
}

export async function getProductById(id: number): Promise<Product> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  return product;
}

export interface ProductInput {
  name: string;
  description: string;
  price: string | number;
  imageUrl: string;
  category: string;
  stockQuantity: number;
}

// Admin create. `name` is unique, so a duplicate surfaces as a 409 rather than
// an unhandled Prisma error.
export async function createProduct(input: ProductInput): Promise<Product> {
  const existing = await prisma.product.findUnique({ where: { name: input.name } });
  if (existing) {
    throw new ApiError(409, 'A product with that name already exists');
  }
  return prisma.product.create({ data: input });
}

// Admin update. Accepts a partial set of fields; 404 if the product is gone.
// Guards the unique name when it's being changed.
export async function updateProduct(
  id: number,
  input: Partial<ProductInput>
): Promise<Product> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  if (input.name && input.name !== product.name) {
    const clash = await prisma.product.findUnique({ where: { name: input.name } });
    if (clash) {
      throw new ApiError(409, 'A product with that name already exists');
    }
  }
  return prisma.product.update({ where: { id }, data: input });
}

// Admin hard-delete. Safe by schema: OrderItem->Product is SetNull (history
// preserved via snapshots) and CartItem->Product is Cascade (drops from carts).
export async function deleteProduct(id: number): Promise<void> {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) {
    throw new ApiError(404, 'Product not found');
  }
  await prisma.product.delete({ where: { id } });
}

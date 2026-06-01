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

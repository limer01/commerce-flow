import type { Request, Response } from 'express';
import * as productService from '../services/product.service';
import type { ProductInput } from '../services/product.service';
import { ApiError } from '../utils/ApiError';

function parseProductId(raw: string): number {
  const id = Number(raw);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, 'Invalid product id');
  }
  return id;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, `${field} is required`);
  }
  return value.trim();
}

// price arrives as a string or number; must be a non-negative finite money value.
function requirePrice(value: unknown): string {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new ApiError(400, 'Price must be a non-negative number');
  }
  return String(value);
}

function requireStock(value: unknown): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0) {
    throw new ApiError(400, 'Stock quantity must be a non-negative integer');
  }
  return n;
}

export const list = async (req: Request, res: Response): Promise<void> => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const products = await productService.getProducts(category);
  res.status(200).json(products);
};

export const detail = async (req: Request, res: Response): Promise<void> => {
  // Reject ids that aren't a plain positive integer before hitting the DB —
  // otherwise parseInt('abc') -> NaN reaches Prisma and surfaces as a 500.
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, 'Invalid product id');
  }
  const product = await productService.getProductById(id);
  res.status(200).json(product);
};

// --- Admin-only mutations (routes guard with authenticate + requireAdmin) ---

export const create = async (req: Request, res: Response): Promise<void> => {
  const input: ProductInput = {
    name: requireString(req.body?.name, 'Name'),
    description: requireString(req.body?.description, 'Description'),
    price: requirePrice(req.body?.price),
    imageUrl: requireString(req.body?.imageUrl, 'Image URL'),
    category: requireString(req.body?.category, 'Category'),
    stockQuantity: requireStock(req.body?.stockQuantity),
  };
  const product = await productService.createProduct(input);
  res.status(201).json(product);
};

export const update = async (req: Request, res: Response): Promise<void> => {
  const id = parseProductId(req.params.id);

  // Only validate/forward fields that were actually provided (partial update).
  const body = req.body ?? {};
  const input: Partial<ProductInput> = {};
  if (body.name !== undefined) input.name = requireString(body.name, 'Name');
  if (body.description !== undefined) input.description = requireString(body.description, 'Description');
  if (body.price !== undefined) input.price = requirePrice(body.price);
  if (body.imageUrl !== undefined) input.imageUrl = requireString(body.imageUrl, 'Image URL');
  if (body.category !== undefined) input.category = requireString(body.category, 'Category');
  if (body.stockQuantity !== undefined) input.stockQuantity = requireStock(body.stockQuantity);

  const product = await productService.updateProduct(id, input);
  res.status(200).json(product);
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  const id = parseProductId(req.params.id);
  await productService.deleteProduct(id);
  res.status(204).send();
};

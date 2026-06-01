import type { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { ApiError } from '../utils/ApiError';

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

import type { Request, Response } from 'express';
import * as productService from '../services/product.service';

export const list = async (req: Request, res: Response): Promise<void> => {
  const category = typeof req.query.category === 'string' ? req.query.category : undefined;
  const products = await productService.getProducts(category);
  res.status(200).json(products);
};

export const detail = async (req: Request, res: Response): Promise<void> => {
  const id = parseInt(req.params.id, 10);
  const product = await productService.getProductById(id);
  res.status(200).json(product);
};

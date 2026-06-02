import type { Request, Response } from 'express';
import * as cartService from '../services/cart.service';
import { ApiError } from '../utils/ApiError';

// Parses a positive-integer route/body id, throwing 400 otherwise (keeps NaN
// out of Prisma, mirroring the product controller).
function parsePositiveInt(value: unknown, label: string): number {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 1) {
    throw new ApiError(400, `Invalid ${label}`);
  }
  return n;
}

export const getCart = async (req: Request, res: Response): Promise<void> => {
  const cart = await cartService.getOrCreateCart(req.userId as number);
  res.status(200).json(cart);
};

export const addItem = async (req: Request, res: Response): Promise<void> => {
  const productId = parsePositiveInt(req.body?.productId, 'product id');
  // quantity is optional and defaults to 1; the service clamps non-positive
  // values up to 1 for "add" semantics.
  const quantity = req.body?.quantity === undefined ? 1 : Number(req.body.quantity);
  const cart = await cartService.addItem(req.userId as number, productId, quantity);
  res.status(201).json(cart);
};

export const updateItem = async (req: Request, res: Response): Promise<void> => {
  const itemId = parsePositiveInt(req.params.id, 'cart item id');
  const quantity = Number(req.body?.quantity);
  if (!Number.isInteger(quantity)) {
    throw new ApiError(400, 'Quantity must be an integer');
  }
  const cart = await cartService.updateItem(req.userId as number, itemId, quantity);
  res.status(200).json(cart);
};

export const removeItem = async (req: Request, res: Response): Promise<void> => {
  const itemId = parsePositiveInt(req.params.id, 'cart item id');
  const cart = await cartService.removeItem(req.userId as number, itemId);
  res.status(200).json(cart);
};

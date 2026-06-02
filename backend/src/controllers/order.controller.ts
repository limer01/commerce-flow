import type { Request, Response } from 'express';
import type { OrderStatus } from '@prisma/client';
import * as orderService from '../services/order.service';
import { ApiError } from '../utils/ApiError';

const ORDER_STATUSES: OrderStatus[] = ['PENDING', 'COMPLETED'];

// authenticate guarantees req.userId is set before these run.
export const create = async (req: Request, res: Response): Promise<void> => {
  const order = await orderService.createOrder(req.userId as number);
  res.status(201).json(order);
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const orders = await orderService.getOrders(req.userId as number);
  res.status(200).json(orders);
};

// --- Admin (routes guard with authenticate + requireAdmin) ---

export const adminList = async (_req: Request, res: Response): Promise<void> => {
  const orders = await orderService.getAllOrders();
  res.status(200).json(orders);
};

export const adminUpdate = async (req: Request, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(400, 'Invalid order id');
  }
  const status = req.body?.status as OrderStatus | undefined;
  if (!status || !ORDER_STATUSES.includes(status)) {
    throw new ApiError(400, 'status must be PENDING or COMPLETED');
  }
  const order = await orderService.updateOrderStatus(id, status);
  res.status(200).json(order);
};

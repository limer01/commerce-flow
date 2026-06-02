import type { Request, Response } from 'express';
import * as orderService from '../services/order.service';

// authenticate guarantees req.userId is set before these run.
export const create = async (req: Request, res: Response): Promise<void> => {
  const order = await orderService.createOrder(req.userId as number);
  res.status(201).json(order);
};

export const list = async (req: Request, res: Response): Promise<void> => {
  const orders = await orderService.getOrders(req.userId as number);
  res.status(200).json(orders);
};

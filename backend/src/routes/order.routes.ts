import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

// All order routes require a valid session.
export const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post('/', asyncHandler(orderController.create));
orderRouter.get('/', asyncHandler(orderController.list));

import { Router } from 'express';
import * as orderController from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

// Admin order management (issue 007). Every route requires an ADMIN session.
export const adminOrderRouter = Router();

adminOrderRouter.use(authenticate, requireAdmin);

adminOrderRouter.get('/', asyncHandler(orderController.adminList));
adminOrderRouter.put('/:id', asyncHandler(orderController.adminUpdate));

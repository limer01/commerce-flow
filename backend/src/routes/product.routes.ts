import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

export const productRouter = Router();

// Public browsing (issue 003).
productRouter.get('/', asyncHandler(productController.list));
productRouter.get('/:id', asyncHandler(productController.detail));

// Admin-only management (issue 006): authenticate then require ADMIN role.
productRouter.post('/', authenticate, requireAdmin, asyncHandler(productController.create));
productRouter.put('/:id', authenticate, requireAdmin, asyncHandler(productController.update));
productRouter.delete('/:id', authenticate, requireAdmin, asyncHandler(productController.remove));

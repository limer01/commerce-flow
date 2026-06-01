import { Router } from 'express';
import * as productController from '../controllers/product.controller';
import { asyncHandler } from '../utils/asyncHandler';

export const productRouter = Router();

productRouter.get('/', asyncHandler(productController.list));
productRouter.get('/:id', asyncHandler(productController.detail));

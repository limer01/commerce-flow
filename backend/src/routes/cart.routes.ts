import { Router } from 'express';
import * as cartController from '../controllers/cart.controller';
import { authenticate } from '../middleware/auth.middleware';
import { asyncHandler } from '../utils/asyncHandler';

// Every cart route requires a valid session — applied once at the router level.
export const cartRouter = Router();

cartRouter.use(authenticate);

cartRouter.get('/', asyncHandler(cartController.getCart));
cartRouter.post('/items', asyncHandler(cartController.addItem));
cartRouter.put('/items/:id', asyncHandler(cartController.updateItem));
cartRouter.delete('/items/:id', asyncHandler(cartController.removeItem));

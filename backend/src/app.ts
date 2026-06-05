import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { authRouter } from './routes/auth.routes';
import { productRouter } from './routes/product.routes';
import { cartRouter } from './routes/cart.routes';
import { orderRouter } from './routes/order.routes';
import { adminOrderRouter } from './routes/admin-order.routes';
import { errorHandler } from './middleware/errorHandler';

// Origin allowed to make credentialed requests. Defaults to the local
// frontend dev server; overridable via FRONTEND_URL for other environments.
const FRONTEND_ORIGIN = process.env.FRONTEND_URL ?? 'http://localhost:3000';

export function createApp(): Express {
  const app = express();

  // Behind a TLS-terminating proxy in production (Railway/Render/Vercel), so
  // trust X-Forwarded-* — needed for req.secure/req.protocol and correct
  // client IPs. Harmless locally.
  if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
  }

  app.use(
    cors({
      origin: FRONTEND_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok' });
  });

  app.use('/auth', authRouter);
  app.use('/products', productRouter);
  app.use('/cart', cartRouter);
  app.use('/orders', orderRouter);
  app.use('/admin/orders', adminOrderRouter);

  // Error handler must be registered last, after all routes.
  app.use(errorHandler);

  return app;
}

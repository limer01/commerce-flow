import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Origin allowed to make credentialed requests. Defaults to the local
// frontend dev server; overridable via FRONTEND_URL for other environments.
const FRONTEND_ORIGIN = process.env.FRONTEND_URL ?? 'http://localhost:3000';

export function createApp(): Express {
  const app = express();

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

  return app;
}

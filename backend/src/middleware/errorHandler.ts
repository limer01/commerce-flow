import type { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';

// Central error handler. Renders every error as the PRD's `{ "error": msg }`
// shape. Known ApiErrors carry their own status; anything else is an
// unexpected fault and becomes a 500 with a generic message (no internal
// details leaked to the client).
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
}

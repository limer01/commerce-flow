import type { Request, Response, NextFunction, RequestHandler } from 'express';

// Wraps an async route handler so any rejected promise is forwarded to
// Express's error middleware instead of crashing the process or hanging the
// request. Keeps controllers free of repetitive try/catch.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}

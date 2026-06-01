import type { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

// Validates the JWT cookie and attaches userId/userRole to the request.
// Rejects with 401 if the cookie is missing, malformed, expired, or tampered.
// Does NOT hit the database — the token is the source of truth for identity;
// handlers that need the full user load it via the auth service.
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = req.cookies?.token as string | undefined;
  if (!token) {
    throw new ApiError(401, 'Not authenticated');
  }

  const payload = verifyToken(token);
  if (!payload) {
    throw new ApiError(401, 'Not authenticated');
  }

  req.userId = payload.userId;
  req.userRole = payload.role;
  next();
}

// Must run AFTER authenticate. Allows the request through only for ADMIN
// users; everyone else gets 403 (authenticated but not authorised).
export function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (req.userRole !== 'ADMIN') {
    throw new ApiError(403, 'Admin access required');
  }
  next();
}

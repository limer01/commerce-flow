import jwt from 'jsonwebtoken';
import type { Role } from '@prisma/client';

// Payload carried inside the JWT. Kept minimal: just enough to authorise
// requests (identify the user and check their role) without a DB lookup on
// every request to the middleware. The full user is loaded by `authenticate`.
export interface TokenPayload {
  userId: number;
  role: Role;
}

// Session lifetime. The PRD requires a 7-day session with no refresh flow.
export const TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set');
  }
  return secret;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, getSecret(), { expiresIn: TOKEN_MAX_AGE_SECONDS });
}

// Verifies and decodes a token. Returns null for any invalid, expired, or
// tampered token rather than throwing, so callers can branch on null.
export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getSecret());
    if (typeof decoded === 'string') return null;
    const { userId, role } = decoded as jwt.JwtPayload & Partial<TokenPayload>;
    if (typeof userId !== 'number' || typeof role !== 'string') return null;
    return { userId, role: role as Role };
  } catch {
    return null;
  }
}

import type { Request, Response, CookieOptions } from 'express';
import * as authService from '../services/auth.service';
import { TOKEN_MAX_AGE_SECONDS } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

const TOKEN_COOKIE = 'token';

// When the frontend and backend are on different sites (e.g. *.vercel.app +
// *.up.railway.app), the browser will only attach the auth cookie to the
// cross-site API calls React Query makes if it is SameSite=None — and None
// REQUIRES Secure. Set COOKIE_CROSS_SITE=true in that deployment. When the two
// share a registrable domain (app./api. subdomains) or run locally, 'lax' is
// correct and avoids needing HTTPS in dev.
const CROSS_SITE = process.env.COOKIE_CROSS_SITE === 'true';

// httpOnly so client JS can never read the token (XSS mitigation). `secure` is
// forced on for cross-site (None mandates it) and otherwise tracks production.
function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: CROSS_SITE ? 'none' : 'lax',
    secure: CROSS_SITE || process.env.NODE_ENV === 'production',
    maxAge: TOKEN_MAX_AGE_SECONDS * 1000,
    path: '/',
  };
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ApiError(400, `${field} is required`);
  }
  return value;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req: Request, res: Response): Promise<void> => {
  const name = requireString(req.body?.name, 'Name');
  const email = requireString(req.body?.email, 'Email');
  const password = requireString(req.body?.password, 'Password');

  if (!EMAIL_RE.test(email.trim())) {
    throw new ApiError(400, 'A valid email is required');
  }
  if (password.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters');
  }

  const { user, token } = await authService.register({ name, email, password });
  res.cookie(TOKEN_COOKIE, token, cookieOptions());
  res.status(201).json({ user });
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const email = requireString(req.body?.email, 'Email');
  const password = requireString(req.body?.password, 'Password');

  const { user, token } = await authService.login({ email, password });
  res.cookie(TOKEN_COOKIE, token, cookieOptions());
  res.status(200).json({ user });
};

export const logout = async (_req: Request, res: Response): Promise<void> => {
  // Clear with the same attributes used to set it, otherwise the browser
  // keeps the original cookie.
  res.clearCookie(TOKEN_COOKIE, { ...cookieOptions(), maxAge: undefined });
  res.status(200).json({ message: 'Logged out' });
};

export const me = async (req: Request, res: Response): Promise<void> => {
  // authenticate middleware guarantees userId is set before this runs.
  const user = await authService.getMe(req.userId as number);
  res.status(200).json({ user });
};

import type { User } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';

// The user shape safe to return to clients / embed in responses — never
// includes the password hash.
export type SafeUser = Omit<User, 'passwordHash'>;

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// Strips the password hash from a User row before it leaves the service layer.
function toSafeUser(user: User): SafeUser {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

// Registers a new customer. Emails are unique and stored lowercased so
// "User@x.com" and "user@x.com" can't both register. Returns the created
// user plus a freshly signed JWT for immediate login.
export async function register(
  input: RegisterInput
): Promise<{ user: SafeUser; token: string }> {
  const email = input.email.trim().toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, 'Email already registered');
  }

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { name: input.name.trim(), email, passwordHash },
  });

  const token = signToken({ userId: user.id, role: user.role });
  return { user: toSafeUser(user), token };
}

// Authenticates a user. Returns the same generic message whether the email
// is unknown or the password is wrong, so the endpoint doesn't leak which
// emails exist.
export async function login(
  input: LoginInput
): Promise<{ user: SafeUser; token: string }> {
  const email = input.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const token = signToken({ userId: user.id, role: user.role });
  return { user: toSafeUser(user), token };
}

// Loads the current user by id (extracted from a verified token by the
// authenticate middleware). A missing user means a valid-but-stale token.
export async function getMe(userId: number): Promise<SafeUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new ApiError(401, 'Not authenticated');
  }
  return toSafeUser(user);
}

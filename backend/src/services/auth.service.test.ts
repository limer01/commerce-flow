import bcrypt from 'bcrypt';
import { register, login, getMe } from './auth.service';
import { verifyToken } from '../utils/jwt';
import { ApiError } from '../utils/ApiError';
import { prisma } from '../lib/prisma';
import { resetDb } from '../test/helpers';

beforeEach(resetDb);
afterAll(() => prisma.$disconnect());

describe('auth.service: register', () => {
  it('stores a bcrypt hash, never the plaintext password', async () => {
    const { user } = await register({
      name: 'Ada',
      email: 'ada@test.com',
      password: 'secret123',
    });

    const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id } });
    expect(row.passwordHash).not.toBe('secret123');
    expect(row.passwordHash).toMatch(/^\$2[aby]\$/); // bcrypt hash format
    expect(await bcrypt.compare('secret123', row.passwordHash)).toBe(true);
  });

  it('never returns the password hash to the caller', async () => {
    const { user } = await register({
      name: 'Ada',
      email: 'ada@test.com',
      password: 'secret123',
    });

    expect(user).not.toHaveProperty('passwordHash');
  });

  it('lowercases the email and rejects a duplicate as 409', async () => {
    await register({ name: 'Ada', email: 'Ada@Test.com', password: 'secret123' });

    const row = await prisma.user.findFirst();
    expect(row?.email).toBe('ada@test.com');

    await expect(
      register({ name: 'Ada 2', email: 'ada@test.com', password: 'secret123' })
    ).rejects.toMatchObject({ statusCode: 409 });
  });
});

describe('auth.service: login', () => {
  it('returns a valid JWT for correct credentials', async () => {
    const { user } = await register({
      name: 'Grace',
      email: 'grace@test.com',
      password: 'correct-horse',
    });

    const { token } = await login({ email: 'grace@test.com', password: 'correct-horse' });

    expect(verifyToken(token)).toMatchObject({ userId: user.id, role: 'CUSTOMER' });
  });

  it('throws a 401 for a wrong password', async () => {
    await register({ name: 'Grace', email: 'grace@test.com', password: 'correct-horse' });

    await expect(
      login({ email: 'grace@test.com', password: 'wrong' })
    ).rejects.toBeInstanceOf(ApiError);
    await expect(
      login({ email: 'grace@test.com', password: 'wrong' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });

  it('throws a 401 for an unknown email', async () => {
    await expect(
      login({ email: 'nobody@test.com', password: 'whatever' })
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});

describe('auth.service: getMe', () => {
  it('returns the safe user for a valid id', async () => {
    const { user } = await register({
      name: 'Linus',
      email: 'linus@test.com',
      password: 'secret123',
    });

    const me = await getMe(user.id);

    expect(me).toMatchObject({ id: user.id, email: 'linus@test.com', name: 'Linus' });
    expect(me).not.toHaveProperty('passwordHash');
  });

  it('throws a 401 when the user id does not exist', async () => {
    await expect(getMe(999999)).rejects.toMatchObject({ statusCode: 401 });
  });
});

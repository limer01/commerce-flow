import { signToken, verifyToken } from './jwt';

describe('jwt', () => {
  it('round-trips a payload through sign and verify', () => {
    const token = signToken({ userId: 42, role: 'CUSTOMER' });

    expect(typeof token).toBe('string');

    const payload = verifyToken(token);
    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(42);
    expect(payload?.role).toBe('CUSTOMER');
  });

  it('returns null for a malformed or tampered token', () => {
    expect(verifyToken('not-a-real-token')).toBeNull();
    expect(verifyToken('')).toBeNull();
  });
});

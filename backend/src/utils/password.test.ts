import { hashPassword, verifyPassword } from './password';

describe('password hashing', () => {
  it('hashes to a value that is not the plaintext', async () => {
    const hash = await hashPassword('password123');

    expect(typeof hash).toBe('string');
    expect(hash).not.toBe('password123');
    expect(hash.length).toBeGreaterThan(0);
  });

  it('produces different hashes for the same input (salted)', async () => {
    const a = await hashPassword('password123');
    const b = await hashPassword('password123');

    expect(a).not.toBe(b);
  });

  it('verifies a correct password against its hash', async () => {
    const hash = await hashPassword('password123');

    await expect(verifyPassword('password123', hash)).resolves.toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('password123');

    await expect(verifyPassword('wrongpassword', hash)).resolves.toBe(false);
  });
});

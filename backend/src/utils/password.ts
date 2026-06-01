import bcrypt from 'bcrypt';

// Cost factor for bcrypt. 10 is a sensible default for an MVP — strong
// enough while keeping login/registration responsive.
const SALT_ROUNDS = 10;

export function hashPassword(plaintext: string): Promise<string> {
  return bcrypt.hash(plaintext, SALT_ROUNDS);
}

export function verifyPassword(
  plaintext: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plaintext, hash);
}

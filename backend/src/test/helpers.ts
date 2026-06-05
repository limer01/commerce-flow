import type { Prisma, Role } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../utils/password';

// Wipes every table and resets identity sequences so each test starts from a
// known-empty database. CASCADE handles FK order; RESTART IDENTITY keeps ids
// predictable. Call in beforeEach so no test depends on another's writes.
export async function resetDb(): Promise<void> {
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "OrderItem", "Order", "CartItem", "Cart", "Product", "User" RESTART IDENTITY CASCADE'
  );
}

let userSeq = 0;
let productSeq = 0;

interface UserOverrides {
  name?: string;
  email?: string;
  password?: string;
  role?: Role;
}

// Creates a persisted user with a real bcrypt-hashed password. Returns the row
// plus the plaintext password (handy for auth/login assertions).
export async function createUser(overrides: UserOverrides = {}) {
  const n = ++userSeq;
  const password = overrides.password ?? 'password123';
  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name: overrides.name ?? `User ${n}`,
      email: overrides.email ?? `user${n}@test.com`,
      passwordHash,
      role: overrides.role ?? 'CUSTOMER',
    },
  });
  return { ...user, password };
}

interface ProductOverrides {
  name?: string;
  description?: string;
  price?: Prisma.Decimal.Value;
  imageUrl?: string;
  category?: string;
  stockQuantity?: number;
}

// Creates a persisted product with sensible defaults; override any field.
export async function createProduct(overrides: ProductOverrides = {}) {
  const n = ++productSeq;
  return prisma.product.create({
    data: {
      name: overrides.name ?? `Product ${n}`,
      description: overrides.description ?? 'A test product',
      price: overrides.price ?? '10.00',
      imageUrl: overrides.imageUrl ?? '/images/test.jpg',
      category: overrides.category ?? 'Tees',
      stockQuantity: overrides.stockQuantity ?? 10,
    },
  });
}

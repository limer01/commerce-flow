import { PrismaClient } from '@prisma/client';

// Single shared Prisma client. Reused across the process to avoid
// exhausting the connection pool (especially under ts-node-dev respawns).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

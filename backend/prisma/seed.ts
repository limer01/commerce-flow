import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

// Idempotent seed. Re-running must not throw on the unique email constraint,
// so we upsert keyed on email rather than create. Issue 003+ extends this
// with product seed data.
async function main(): Promise<void> {
  const adminEmail = 'admin@store.com';
  const passwordHash = await hashPassword('password123');

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: 'Store Admin',
      email: adminEmail,
      passwordHash,
      role: 'ADMIN',
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Seeded admin user: ${admin.email} (id ${admin.id})`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

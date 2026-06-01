import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

// 12 products, 2 per category. `name` is unique, so we upsert keyed on it to
// keep the seed idempotent. One item per a couple of categories is left at
// stockQuantity 0 to exercise the "Out of Stock" UI. imageUrl points at the
// static files under frontend/public/images.
const products = [
  // Hoodies
  { name: 'Shadow Pullover Hoodie', description: 'Heavyweight 400gsm fleece pullover with a boxy fit and double-lined hood.', price: '89.99', imageUrl: '/images/hoodie-1.jpg', category: 'Hoodies', stockQuantity: 24 },
  { name: 'Eclipse Zip Hoodie', description: 'Full-zip hoodie in washed black with tonal embroidery and ribbed cuffs.', price: '94.99', imageUrl: '/images/hoodie-2.jpg', category: 'Hoodies', stockQuantity: 0 },
  // Tees
  { name: 'Static Logo Tee', description: 'Relaxed-fit tee in 100% combed cotton with a screen-printed chest logo.', price: '34.99', imageUrl: '/images/tee-1.jpg', category: 'Tees', stockQuantity: 60 },
  { name: 'Grid Oversized Tee', description: 'Drop-shoulder oversized tee with a grayscale grid back graphic.', price: '39.99', imageUrl: '/images/tee-2.jpg', category: 'Tees', stockQuantity: 42 },
  // Cargo Pants
  { name: 'Utility Cargo Pants', description: 'Tapered ripstop cargos with six pockets and adjustable ankle cinches.', price: '109.99', imageUrl: '/images/cargo-1.jpg', category: 'Cargo Pants', stockQuantity: 18 },
  { name: 'Tactical Wide Cargos', description: 'Wide-leg cargo trousers in cotton twill with mapped storage pockets.', price: '119.99', imageUrl: '/images/cargo-2.jpg', category: 'Cargo Pants', stockQuantity: 12 },
  // Sneakers
  { name: 'Vector Low Sneakers', description: 'Low-top sneakers on a chunky vulcanized sole with suede overlays.', price: '139.99', imageUrl: '/images/sneaker-1.jpg', category: 'Sneakers', stockQuantity: 30 },
  { name: 'Apex Runner Sneakers', description: 'Mesh runners with a sculpted EVA midsole and reflective heel tab.', price: '149.99', imageUrl: '/images/sneaker-2.jpg', category: 'Sneakers', stockQuantity: 0 },
  // Caps
  { name: 'Core Logo Cap', description: 'Six-panel cotton cap with a curved brim and embroidered logo.', price: '29.99', imageUrl: '/images/cap-1.jpg', category: 'Caps', stockQuantity: 80 },
  { name: 'Trail Mesh Cap', description: 'Five-panel trail cap with a breathable mesh back and rope detail.', price: '32.99', imageUrl: '/images/cap-2.jpg', category: 'Caps', stockQuantity: 55 },
  // Bags
  { name: 'Transit Crossbody Bag', description: 'Water-resistant crossbody sling with a magnetic buckle and zip stash.', price: '54.99', imageUrl: '/images/bag-1.jpg', category: 'Bags', stockQuantity: 36 },
  { name: 'Cargo Tech Backpack', description: '24L roll-top backpack with a padded laptop sleeve and webbing loops.', price: '99.99', imageUrl: '/images/bag-2.jpg', category: 'Bags', stockQuantity: 21 },
];

// Idempotent seed. Re-running must not throw on the unique constraints, so we
// upsert (keyed on the unique email / product name) rather than create.
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

  for (const product of products) {
    await prisma.product.upsert({
      where: { name: product.name },
      update: product,
      create: product,
    });
  }

  // eslint-disable-next-line no-console
  console.log(`Seeded ${products.length} products across 6 categories`);
}

main()
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

// Runs once before the whole Jest suite. Loads the isolated test-database
// config and applies migrations so the schema is guaranteed present (important
// for a clean CI database). Plain JS so Jest can require it without a TS
// transform step.
const path = require('path');
const { execSync } = require('child_process');
require('dotenv').config({
  path: path.resolve(__dirname, '.env.test'),
  override: true,
  quiet: true,
});

module.exports = async () => {
  const url = process.env.DATABASE_URL ?? '';
  if (!/_test\b/.test(url)) {
    throw new Error(
      `Refusing to migrate: DATABASE_URL is not a *_test database (got: ${url || '(unset)'}).`
    );
  }

  execSync('npx prisma migrate deploy', {
    cwd: __dirname,
    stdio: 'inherit',
    env: process.env,
  });
};

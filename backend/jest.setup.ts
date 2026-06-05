import path from 'path';
import { config } from 'dotenv';

// Load the isolated test-database config, OVERRIDING any dev values from a
// previously-loaded .env. The suite truncates tables between tests, so it must
// never point at the development/production database.
config({ path: path.resolve(__dirname, '.env.test'), override: true, quiet: true });

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-jwt-secret';
process.env.NODE_ENV = 'test';

// Hard safety guard: refuse to run if DATABASE_URL is not a *_test database.
// Without this, a missing/misconfigured .env.test could silently wipe the dev DB.
if (!/_test\b/.test(process.env.DATABASE_URL ?? '')) {
  throw new Error(
    `Refusing to run the test suite: DATABASE_URL is not a *_test database ` +
      `(got: ${process.env.DATABASE_URL ?? '(unset)'}). Check backend/.env.test.`
  );
}

## Parent PRD
issues/prd.md

## What to build
Write backend service-layer tests for the four highest-risk modules. Tests use Jest with a real PostgreSQL test database — no Prisma mocking. Each test verifies external behaviour (inputs and outputs) rather than implementation details.

A `.env.test` file provides a separate `DATABASE_URL` pointing to a dedicated test database. The test database is migrated before the suite runs and reset between tests (transaction rollback or table truncation). No test should depend on the order of other tests.

**Order Service** (highest priority):
- Creating an order produces the correct `Order` and `OrderItem` records
- `priceAtPurchase` and `productName` are snapshotted at creation time, not a later-changed value
- Order history still renders correctly after the underlying product is deleted (snapshot independence; `productId` is null but the order is intact)
- `stockQuantity` is decremented correctly for each item in the order
- An order requesting more than the available stock is rejected with no partial writes (conditional-decrement guard; e.g. cart quantity 5 against stock 3)
- The cart is cleared after a successful order
- If any cart item has insufficient stock, no order is created, no stock is changed, and the cart is unchanged (transaction rollback)

**Cart Service:**
- Adding a product creates a new cart item
- Adding the same product again increments quantity (upsert, no duplicate row)
- Setting quantity to 0 via update deletes the item
- Adding an out-of-stock product (`stockQuantity === 0`) is rejected with an error
- Updating or deleting a cart item that belongs to another user returns 404 / throws (ownership scoping — IDOR prevented)

**Auth Service:**
- Registering stores a bcrypt-hashed password (not plaintext)
- Logging in with correct credentials returns a valid JWT
- Logging in with wrong password throws an auth error
- `getMe` returns the correct user for a valid user ID

**Product Service:**
- `getProducts()` with no filter returns all products
- `getProducts({ category: 'Hoodies' })` returns only Hoodies
- `getProductById` with a valid ID returns the product
- `getProductById` with an invalid ID returns null or throws a not-found error

## Acceptance criteria
- [ ] `npm test` runs all tests in `/backend`
- [ ] Tests use a real PostgreSQL test database, not Prisma mocks
- [ ] Test database is isolated from the development database via `.env.test`
- [ ] All Order Service behaviours listed above have passing tests (incl. oversell guard and snapshot-independence-after-delete)
- [ ] All Cart Service behaviours listed above have passing tests (incl. ownership scoping / IDOR)
- [ ] All Auth Service behaviours listed above have passing tests
- [ ] All Product Service behaviours listed above have passing tests
- [ ] No test depends on another test's side effects
- [ ] All tests pass in CI (clean database state)

## Blocked by
Blocked by issues/005-checkout-and-orders.md and issues/006-admin-product-management.md
(Can be built in parallel with issues/007-admin-order-management.md)

## User stories addressed
None — quality and reliability only.

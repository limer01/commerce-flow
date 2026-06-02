## Parent PRD
issues/prd.md

## What to build
Deliver end-to-end checkout and order history: database schema, API, and frontend. A logged-in customer should be able to place an order from their cart, land on a confirmation page, and later view their full order history with line items.

**Schema:** Add `Order` (`id`, `userId`, `status`, `totalPrice`, `createdAt`, `updatedAt`) and `OrderItem` (`id`, `orderId`, `productId` (nullable), `productName`, `quantity`, `priceAtPurchase`, `createdAt`, `updatedAt`) models and run the migration. `Order.status` is an enum: `PENDING | COMPLETED`. Money fields (`Order.totalPrice`, `OrderItem.priceAtPurchase`) use Prisma `Decimal`, not `Float`. `OrderItem → Product` uses `onDelete: SetNull` (hence the nullable `productId`); order history renders from the snapshotted `productName`/`priceAtPurchase` and does not depend on the live product. See PRD → Database Schema Changes and Referential Integrity.

**API:**
- `POST /orders` (authenticated) — atomic Prisma transaction that: (1) fetches the user's cart with all items and their products, (2) re-validates stock for every item (rejects with 400 and `{ "error": "..." }` naming the out-of-stock product if any fail), (3) creates the `Order` record with `totalPrice`, (4) creates `OrderItem` records snapshotting both `priceAtPurchase` and `productName` from the current product, (5) decrements `stockQuantity` on each product using a **conditional `updateMany`** (`where: { id, stockQuantity: { gte: quantity } }`) and treats an affected count of 0 as insufficient stock → roll back, (6) deletes all cart items and the cart. If any step fails, the entire transaction is rolled back. The conditional decrement (not a read-then-write) is what prevents oversell under concurrent checkouts — see PRD → Order Module.
- `GET /orders` (authenticated) — returns the current user's orders with nested `OrderItem` records, each rendered from the snapshotted `productName` and `priceAtPurchase` (no join to `Product` required). Ordered by `createdAt` descending.

**Frontend:**
- `/checkout` (protected) — shows a read-only summary of cart items and total. Single "Place Order" button. Displays an inline error if checkout fails (e.g. stock issue). Disables the button and shows a loading state while the request is in-flight.
- `/checkout/success` — shown after a successful order. Displays a confirmation message and a "Continue Shopping" link back to `/products`.
- `/orders` (protected) — lists all past orders. Each order shows its date, status, total, and all line items (product name, quantity, price paid per unit).

## Acceptance criteria
- [ ] `POST /orders` creates an order and order items in a single transaction
- [ ] `POST /orders` decrements `stockQuantity` on each purchased product via a conditional update (no oversell under concurrent requests)
- [ ] `POST /orders` clears the user's cart after a successful order
- [ ] `POST /orders` snapshots `priceAtPurchase` and `productName` at the time of order, not the current product values
- [ ] `POST /orders` returns 400 if any cart item has insufficient stock (incl. requested quantity > available), with no partial writes
- [ ] `POST /orders` returns 401 for unauthenticated requests
- [ ] Money fields are stored as `Decimal` and rendered correctly on the frontend (parsed from JSON string)
- [ ] `GET /orders` returns orders rendered from snapshotted fields; history still displays correctly after the underlying product is deleted
- [ ] `/checkout` page displays cart summary and total
- [ ] Placing an order redirects to `/checkout/success`
- [ ] `/checkout/success` shows confirmation message and "Continue Shopping" link
- [ ] Cart is empty after returning to `/cart` following a successful order
- [ ] `/orders` page displays all past orders with line items
- [ ] Historical order prices reflect what was paid, not the current product price
- [ ] Order status shows as `PENDING` on creation

## Blocked by
Blocked by issues/004-cart.md

## User stories addressed
- User story 25 (navigate to checkout)
- User story 26 (checkout shows cart summary)
- User story 27 (place order with single button)
- User story 28 (stock re-validated at checkout)
- User story 29 (error shown if stock fails at checkout)
- User story 30 (redirect to confirmation page)
- User story 31 (Continue Shopping link)
- User story 32 (cart cleared after order)
- User story 33 (order history page)
- User story 34 (order history shows items, total, status, date)
- User story 35 (priceAtPurchase preserved)

---

## Completion note (2026-06-02)

Completed in b36d3c3. All acceptance criteria met, verified on host.

- Backend: Order/OrderItem + migration; POST/GET /orders behind `authenticate`
  (401 for guests). createOrder runs one `$transaction`: re-validate stock ->
  create Order + snapshotted OrderItems (productName, priceAtPurchase) ->
  conditional `updateMany` decrement (oversell-safe; count 0 rolls back) ->
  clear cart. 400 on insufficient stock with no partial writes. SetNull keeps
  order history after a product is deleted.
- Frontend: usePlaceOrder/useOrders; /checkout (summary + total, Place Order
  with loading + inline error), /checkout/success (confirmation + Continue
  Shopping), /orders (date, status, total, line items from snapshots).
- Verified: backend 30/30 tests + tsc; frontend tsc; live e2e (place order
  PENDING $179.98 -> cart emptied -> stock 24->22 -> GET /orders -> 400 oos).

Note: conditional-decrement transaction rollback is a concurrency property and
is not unit-tested; the requested>available 400 path is covered.

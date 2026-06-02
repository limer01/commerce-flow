## Parent PRD
issues/prd.md

## What to build
Deliver end-to-end cart management: database schema, API, and frontend. A logged-in customer should be able to add products to their cart, adjust quantities, remove items, and see a live count in the nav — with their cart persisted across sessions.

**Schema:** Add `Cart` (`id`, `userId`, `createdAt`, `updatedAt`) and `CartItem` (`id`, `cartId`, `productId`, `quantity`, `createdAt`, `updatedAt`) models and run the migration.

**API:** Implement all cart endpoints behind the `authenticate` middleware:
- `GET /cart` — returns the user's cart with all items and their product details (name, price, imageUrl). Creates an empty cart if none exists.
- `POST /cart/items` — adds a product to the cart. If the product already exists in the cart, increments its quantity (upsert). Rejects with 400 if `stockQuantity < 1`.
- `PUT /cart/items/:id` — sets the quantity to the provided value. If quantity is 0 or below, deletes the item implicitly.
- `DELETE /cart/items/:id` — removes the item from the cart.

**Ownership scoping (security — required):** `PUT` and `DELETE` operate on a client-supplied cart-item id. The service MUST scope every lookup to the requesting user's cart (`where: { id, cart: { userId } }`) and return 404 when there is no match. Authentication proves identity but not ownership; without this scoping, user A can mutate or delete user B's cart items (IDOR). See PRD → Cart Module → Ownership scoping.

**Schema note:** The `CartItem → Product` relation uses `onDelete: Cascade` so that deleting a product (issues/006) automatically removes it from any active carts. `CartItem → Cart` also cascades. See PRD → Referential Integrity.

**Frontend:**
- Wire up the "Add to Cart" button on `/products` and `/products/:id` (stubbed in issues/003-product-browsing.md). Unauthenticated users are redirected to `/login`.
- `/cart` page (protected via `useRequireAuth()`): displays all cart items with name, image, unit price, quantity controls (+/- or input), line total, and a cart grand total. Includes a "Remove" action per item and a "Proceed to Checkout" button linking to `/checkout`.
- Nav cart icon shows a live badge with the total number of cart items, sourced from the cached React Query cart response.

## Acceptance criteria
- [ ] `POST /cart/items` creates a cart item for a logged-in user
- [ ] `POST /cart/items` with an existing product increments quantity instead of creating a duplicate
- [ ] `POST /cart/items` returns 400 when `stockQuantity === 0`
- [ ] `PUT /cart/items/:id` sets the quantity to the given value
- [ ] `PUT /cart/items/:id` with quantity `<= 0` deletes the item
- [ ] `DELETE /cart/items/:id` removes the item
- [ ] `PUT`/`DELETE /cart/items/:id` return 404 when the item belongs to a different user (ownership scoped — IDOR prevented)
- [ ] All cart endpoints return 401 for unauthenticated requests
- [ ] `GET /cart` returns cart items with product name, price, and image
- [ ] `/cart` page displays all items with quantity controls and line totals
- [ ] Cart grand total is correct
- [ ] Adjusting quantity updates the UI immediately via React Query mutation + cache invalidation
- [ ] Nav badge shows the correct item count and updates after add/remove
- [ ] Clicking "Add to Cart" while unauthenticated redirects to `/login`
- [ ] Cart data persists across browser sessions (DB-backed, not localStorage)

## Blocked by
Blocked by issues/002-customer-auth.md and issues/003-product-browsing.md

## User stories addressed
- User story 14 (add product to cart)
- User story 15 (cart persisted in database)
- User story 16 (view cart page)
- User story 17 (cart item details: name, image, price, quantity, line total)
- User story 18 (adjust quantity)
- User story 19 (quantity to zero removes item)
- User story 20 (explicit remove item)
- User story 21 (cart grand total)
- User story 22 (nav cart badge)
- User story 23 (out of stock rejection on add)
- User story 24 (duplicate add increments quantity)
- User story 10 (redirect to login when unauthenticated)

---

## Completion note (2026-06-02)

Completed in 20a28b0. All acceptance criteria met, verified on host.

- Backend: Cart/CartItem models + migration; GET/POST/PUT/DELETE /cart behind
  `authenticate` (401 for guests). Add = upsert/increment, 400 on out-of-stock,
  404 unknown product. PUT sets qty (<=0 deletes). DELETE removes.
- SECURITY (IDOR): PUT/DELETE scope lookups to `cart: { userId }` -> 404 for
  cross-user items. TDD-verified RED (B mutating A returned 200) before the fix.
- Frontend: auth-gated useCart + add/update/remove mutations seeding the cache;
  AddToCartButton (guests -> /login, disabled when OOS) on card + detail;
  /cart page with qty controls, line totals, grand total, remove, checkout link;
  nav cart badge with live count.
- Verified: backend 22/22 tests + tsc; frontend tsc + build (9/9 pages); live
  e2e add/increment/400/setqty/delete.

"Proceed to Checkout" links to /checkout, built in issues/005.

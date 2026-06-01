# PRD: Streetwear Store — Full-Stack Ecommerce MVP

## Problem Statement

There is no existing application. We need to build a complete, end-to-end ecommerce MVP for a streetwear brand from scratch. The store must support two types of users: customers who browse and purchase products, and admins who manage the catalogue and view orders. The application must be production-style in structure — clean separation of concerns, a real database, proper authentication — while remaining simple enough to be fully functional as an MVP without payment integration, email, or advanced ecommerce features.

---

## Solution

Build a full-stack monorepo application called "Streetwear Store" with a Next.js (App Router) frontend and an Express.js + TypeScript backend. The frontend communicates with the backend exclusively via client-side REST API calls using React Query. Authentication is handled with JWT stored in httpOnly cookies. The database is PostgreSQL managed via Prisma ORM. The backend follows a strict routes → controllers → services layered architecture. All business logic lives in services; Prisma is only used in the services layer.

The store allows customers to browse products, manage a persistent cart, and place orders. Admins can manage products (create, read, update, delete) and update order statuses. The app ships with seed data: 12 products across 6 streetwear categories and one pre-seeded admin account.

---

## User Stories

### Customer — Browsing

1. As a customer, I want to view a homepage, so that I get a feel for the brand and can navigate to the product catalogue.
2. As a customer, I want to browse all products on a products listing page, so that I can discover what the store sells.
3. As a customer, I want to filter products by category (Hoodies, Tees, Cargo Pants, Sneakers, Caps, Bags), so that I can find items relevant to my interests quickly.
4. As a customer, I want to see a product card with name, price, image, and category on the listing page, so that I can evaluate products at a glance.
5. As a customer, I want to see an "Out of Stock" badge and a disabled "Add to Cart" button on products with zero stock, so that I know immediately which items are unavailable.
6. As a customer, I want to click a product card and view a full product detail page, so that I can read the description and see a larger image before deciding to buy.
7. As a customer, I want to see the product's current stock availability on its detail page, so that I know if it will ship.

### Customer — Authentication

8. As a customer, I want to register for an account with my name, email, and password, so that I can make purchases and track orders.
9. As a customer, I want to log in with my email and password, so that I can access my cart and order history.
10. As a customer, I want to be redirected to the login page when I try to add a product to my cart without being logged in, so that I understand I need an account to shop.
11. As a customer, I want to be logged out and my session cleared when I click logout, so that my account is secure on shared devices.
12. As a customer, I want the navigation bar to show my login state — showing "Login/Register" when logged out and "Orders/Logout" when logged in — so that I always know my current session state.
13. As a customer, I want my session to persist for 7 days without needing to log in again, so that I have a convenient shopping experience.

### Customer — Cart

14. As a customer, I want to add a product to my cart from the product listing or detail page, so that I can collect items for purchase.
15. As a customer, I want my cart to be saved to the database, so that my items are still there if I close the browser and return later.
16. As a customer, I want to view all items in my cart on the cart page, so that I can review what I plan to buy.
17. As a customer, I want to see each cart item's name, image, unit price, quantity, and line total, so that I understand exactly what I am about to purchase.
18. As a customer, I want to increase or decrease the quantity of an item in my cart, so that I can adjust my order before checking out.
19. As a customer, I want a cart item to be removed automatically when I set its quantity to zero, so that I don't need a separate "remove" action.
20. As a customer, I want to remove an item from my cart explicitly, so that I can discard items I no longer want.
21. As a customer, I want to see a running cart total on the cart page, so that I know how much I am about to spend.
22. As a customer, I want to see a live cart item count badge on the cart icon in the navigation bar, so that I always know how many items are in my cart without navigating to the cart page.
23. As a customer, I want to be told if a product is out of stock when I try to add it to my cart, so that I am not misled about availability.
24. As a customer, I want adding the same product to my cart a second time to increase the quantity rather than create a duplicate line, so that my cart stays clean and readable.

### Customer — Checkout & Orders

25. As a customer, I want to navigate from the cart page to a checkout page, so that I can complete my purchase.
26. As a customer, I want the checkout page to show a summary of my cart items and total, so that I can confirm my order before placing it.
27. As a customer, I want to place my order with a single "Place Order" button, so that the checkout process is fast and simple.
28. As a customer, I want the system to re-validate stock for all cart items at the moment I place my order, so that I cannot accidentally purchase items that have just sold out.
29. As a customer, I want to see a clear error message if any cart item is out of stock at checkout, so that I know which item to remove before retrying.
30. As a customer, I want to be redirected to an order confirmation page after a successful order, so that I get clear closure that my purchase went through.
31. As a customer, I want the confirmation page to include a "Continue Shopping" link, so that I can easily return to the store.
32. As a customer, I want my cart to be cleared automatically after a successful order, so that I start fresh for my next purchase.
33. As a customer, I want to view my order history on an orders page, so that I can track my past purchases.
34. As a customer, I want each order in my history to show its items (name, quantity, price paid), total, status, and date, so that I have a complete record of what I ordered.
35. As a customer, I want the price I paid for each item to be recorded at the time of purchase, so that historical orders are not affected by future price changes.

### Admin — Authentication & Access

36. As an admin, I want to log in with my admin credentials, so that I can access the management panel.
37. As an admin, I want to see an "Admin" link in the navigation bar when logged in as an admin, so that I can quickly access the management panel.
38. As an admin, I want non-admin users to be blocked from accessing admin pages, so that the management panel is secure.
39. As an admin, I want to be redirected away from admin pages if I am not authenticated, so that the admin panel is never publicly accessible.

### Admin — Product Management

40. As an admin, I want to view a list of all products with their name, category, price, and stock quantity, so that I can monitor the catalogue at a glance.
41. As an admin, I want to create a new product by filling in a modal form with name, description, price, image URL, category, and stock quantity, so that I can expand the catalogue without leaving the page.
42. As an admin, I want to edit an existing product's details via a modal form, so that I can update prices, descriptions, or stock levels.
43. As an admin, I want to delete a product from the catalogue, so that I can remove discontinued items.
44. As an admin, I want the product list to update immediately after I create, edit, or delete a product, so that I always see the current state of the catalogue.

### Admin — Order Management

45. As an admin, I want to view all customer orders with customer name, order date, total, and status, so that I can monitor sales activity.
46. As an admin, I want to mark an order as "Completed", so that I can track fulfilment progress.
47. As an admin, I want the order status to update immediately in the UI after I change it, so that I have a real-time view of order states.

---

## Implementation Decisions

### Monorepo Structure
The project is a monorepo with two top-level directories: `/frontend` (Next.js) and `/backend` (Express.js). There is no shared types package — each side defines its own TypeScript types independently. There is no root-level build orchestration.

### Backend Architecture
The backend strictly follows a three-layer architecture: routes → controllers → services. Routes only wire up HTTP methods and paths. Controllers handle request/response and call services. Services contain all business logic and are the only layer that uses Prisma. This separation is enforced as a hard rule.

### Auth Module
Handles registration, login, logout, and session retrieval. Password hashing uses bcrypt. JWT is generated on login and stored as an httpOnly cookie with a 7-day expiry. No refresh token flow. Two middleware functions are derived from this module: `authenticate` (validates JWT cookie and attaches the user to the request) and `requireAdmin` (checks that the attached user has the ADMIN role). All protected routes use one or both of these middlewares.

### Product Module
Handles full CRUD for products. The list endpoint accepts an optional `?category=` query parameter for filtering. No pagination. The service exposes a stock check helper used by the Cart module.

### Cart Module
Each authenticated user has exactly one persistent cart in the database. The cart service manages this cart and its items. Adding a product that already exists in the cart increments its quantity (upsert behaviour). Updating an item's quantity to 0 or below implicitly deletes the item. Stock is validated on add-to-cart: if `stockQuantity < 1`, the request is rejected with a 400 error.

**Ownership scoping (security):** All operations on a specific cart item (`PUT`/`DELETE /cart/items/:id`) must scope the lookup to the requesting user's cart — i.e. `where: { id, cart: { userId } }` — and return 404 if no match. The `:id` is a cart-item id supplied by the client; without this scoping a user could read or mutate another user's cart items (IDOR). Authentication alone is insufficient; ownership must be verified at the data layer.

**Cart quantity is not capped against stock.** Add-to-cart and quantity-update only check that the product is in stock at all (`stockQuantity >= 1`). A user may set a cart quantity higher than the available stock; this is deliberately allowed and is only caught at checkout (see Order Module). This keeps cart logic simple at the cost of surfacing over-quantity errors only at the final step — an accepted MVP trade-off.

### Order Module
This is the most complex backend module. Creating an order performs the following steps atomically in a single Prisma transaction: (1) fetch the user's cart with all items and their products, (2) re-validate stock for every item, (3) create the Order record, (4) create OrderItem records capturing both `priceAtPurchase` and `productName` from the current product, (5) decrement `stockQuantity` on each product, (6) delete all cart items and the cart itself. If stock validation fails for any item, the entire transaction is aborted and a 400 error is returned naming the offending product. The order list endpoint for customers returns OrderItems using their snapshotted fields (no join to `Product` required for display). The admin order list endpoint returns all orders with customer name and email.

**Stock decrement must be conditional, not read-then-write.** The decrement in step (5) uses a guarded update — `updateMany({ where: { id, stockQuantity: { gte: quantity } }, data: { stockQuantity: { decrement: quantity } } })` — and treats an affected-row count of `0` as "insufficient stock" and rolls back the transaction. A naive read-the-stock-then-decrement sequence is not safe even inside a transaction: under Postgres' default Read Committed isolation, two concurrent checkouts can both read `stock = 1`, both pass validation, and both decrement, overselling to `-1`. The conditional update closes this race because the `WHERE stockQuantity >= quantity` predicate is evaluated atomically at write time. The earlier read-based validation (step 2) is retained for producing friendly error messages, but the conditional decrement is the actual correctness guarantee.

### Database Schema Changes vs. Original Spec
- `User` gains a `name: String` field (required).
- `User`, `Product`, `Cart`, `CartItem`, `Order`, `OrderItem` all get `createdAt` and `updatedAt` timestamps managed by Prisma.
- `Order.status` values remain `PENDING` and `COMPLETED`.
- No slug field on Product (URLs use numeric IDs).
- **`OrderItem` snapshots the product name** (`productName: String`) in addition to `priceAtPurchase`. Order history must be fully self-contained: it renders from snapshotted fields and does not join back to `Product` for display. This means a product can be deleted or renamed without corrupting historical orders. (`imageUrl` is intentionally *not* snapshotted — order history is text-only; see Further Notes.)
- **Money is stored as Prisma `Decimal`** (Postgres `numeric`), never `Float`. This applies to `Product.price`, `Order.totalPrice`, and `OrderItem.priceAtPurchase`. Floats cause rounding errors in totals. Note: Prisma serializes `Decimal` to a JSON **string**, so the frontend must parse these values before doing arithmetic or currency formatting.

### Referential Integrity (onDelete behaviour)
- `OrderItem → Product`: **`onDelete: SetNull`** (the `productId` FK is nullable). Order history does not depend on the join (it uses the snapshotted `productName`/`priceAtPurchase`), so a deleted product simply nulls the back-reference without breaking history.
- `CartItem → Product`: **`onDelete: Cascade`**. If an admin deletes a product, it is removed from any active carts automatically. The cart UI reflects the change on next fetch.
- `CartItem → Cart`, `OrderItem → Order`, `Cart → User`, `Order → User`: **`onDelete: Cascade`** down the ownership hierarchy.

### API Contracts
All error responses follow the shape `{ "error": "human-readable message" }` with an appropriate HTTP status code (400, 401, 403, 404, 409, 500).

New/modified endpoints vs. original spec:
- `GET /products?category=` — supports optional category filter
- `GET /orders` — returns orders with nested OrderItems and Product details
- `PUT /admin/orders/:id` — admin updates order status (`{ "status": "COMPLETED" }`)
- `GET /admin/orders` — returns all orders with customer name and email

### Frontend Architecture
All API communication is client-side via React Query. No Next.js Server Components are used for data fetching. An axios instance is configured with `baseURL` read from `NEXT_PUBLIC_API_URL` (defaulting to `http://localhost:5000` in development) and `withCredentials: true` (required for httpOnly cookie forwarding). The base URL is never hardcoded.

Auth state is derived from `GET /auth/me` cached by React Query. A `useAuth()` hook exposes `user`, `isLoading`, and `isAuthenticated`. A `useRequireAuth()` hook redirects to `/login` if the user is not authenticated — used on `/cart`, `/checkout`, `/orders`. Admin route protection is handled by a layout component at `app/admin/layout.tsx` that checks `user.role === "ADMIN"`.

React Query handles all server state (products, cart, orders). Mutations (add to cart, place order, etc.) invalidate the relevant query cache keys on success.

### Frontend Pages (final list)
- `/` — Home
- `/products` — Product listing with category filter
- `/products/:id` — Product detail
- `/cart` — Cart (protected)
- `/login` — Login
- `/register` — Register
- `/checkout` — Checkout confirmation (protected)
- `/checkout/success` — Order success page
- `/orders` — Order history (protected)
- `/admin/products` — Admin product management (admin only)
- `/admin/orders` — Admin order management (admin only)

### Ports
- Frontend: `3000`
- Backend: `5000`

### Seed Data
The seed script creates: 12 products (2 per category: Hoodies, Tees, Cargo Pants, Sneakers, Caps, Bags) with local image references (`/images/*.jpg`), and one admin user (`admin@store.com` / `password123`). Product images are stored as static files in `/frontend/public/images/`.

The seed must be **idempotent** — re-running `prisma db seed` must not throw on the unique `email` / unique product constraints. Use `upsert` keyed on the unique field rather than `create`, so the script can be run repeatedly against an existing database.

### CORS
The Express backend configures CORS to allow `http://localhost:3000` as the only origin, with `credentials: true` to permit cookie forwarding.

---

## Testing Decisions

### What Makes a Good Test
Tests should verify external behaviour — what goes in and what comes out — not implementation details like which Prisma methods were called or how many intermediate steps were taken. A good test says: "given this input and this database state, the service returns this result or throws this error." Tests should be independent, deterministic, and focused on one behaviour per test case.

### Modules to Test
The following backend service modules warrant unit/integration tests, in priority order:

1. **Order Service** — highest complexity and highest business risk. Key behaviours: transaction atomicity, stock re-validation failure rolls back everything, stock is correctly decremented, cart is cleared, `priceAtPurchase` and `productName` are snapshotted correctly, and order history still renders after the underlying product is deleted (snapshot independence). The conditional-decrement oversell guard is verified at the service level (an order requesting more than available stock is rejected with no partial writes).
2. **Cart Service** — upsert behaviour (adding existing product increments quantity), implicit delete at quantity 0, stock check rejection on add, and **ownership scoping** (a user cannot update or delete a cart item belonging to another user — returns 404).
3. **Auth Service** — password hashing, JWT generation, login rejection with wrong password, `getMe` returning correct user.
4. **Product Service** — category filter returns only matching products, stock check helper returns correct boolean.

Frontend hooks (React Query) are integration-level and lower priority for the MVP. No frontend tests are required in the initial build.

### Prior Art
There is no existing test infrastructure in the repo. Tests should be written using Jest with a test database (separate `DATABASE_URL` in a `.env.test` file). Prisma's `$transaction` and real database calls should be used — no mocking of Prisma. This avoids the class of bugs where mocked tests pass but real database behaviour differs.

---

## Out of Scope

- Payment integration of any kind
- Email notifications (order confirmation, password reset)
- Password reset flow
- Mobile optimisation
- Guest cart / unauthenticated shopping
- Wishlists, reviews, coupons, discount codes
- Analytics or reporting dashboards
- Product search by keyword
- Pagination on any endpoint
- Image upload (admins provide image filenames matching files in `/public/images/`)
- Order cancellation by customer
- Inventory alerts or low-stock notifications
- Shipping address collection
- Multiple admin roles or permission levels
- Refresh token flow

---

## Further Notes

- The `priceAtPurchase` and `productName` snapshot fields on `OrderItem` are critical for order history accuracy and independence. Product prices and names may be changed by admins, and products may be deleted entirely; historical orders must reflect what the customer actually bought and paid, with no dependence on the live `Product` row. `imageUrl` is deliberately not snapshotted — order history is rendered as text (name, quantity, price paid) without thumbnails, which keeps the snapshot small and avoids broken-image issues for deleted products.
- The order creation transaction is the most risk-prone piece of the system. It must be atomic AND oversell-safe. Atomicity (all-or-nothing) is necessary but not sufficient: under concurrent checkouts, atomicity alone still allows two transactions to both read the same stock value and oversell. The conditional `updateMany` decrement (see Order Module) is what actually prevents oversell. A naive read-then-decrement would pass single-user testing and fail silently under load.
- The admin seed user (`admin@store.com` / `password123`) is for development only. In a production deployment this would be replaced with a proper admin provisioning flow.
- All static product images should be sourced and placed in `/frontend/public/images/` before the seed script is run, as the seed data references these paths directly.
- The `useRequireAuth()` hook will cause a brief flash of the page before redirecting if auth state is still loading. This is acceptable for an MVP — a loading spinner on the protected page while `isLoading` is true is sufficient.

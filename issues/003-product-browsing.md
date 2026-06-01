## Parent PRD
issues/prd.md

## What to build
Deliver end-to-end product browsing: database schema, API, frontend pages, and seed data. A visitor should be able to land on the home page, browse all products, filter by category, and view a product detail page — all without being logged in.

**Schema:** Add the `Product` model (`id`, `name`, `description`, `price`, `imageUrl`, `category`, `stockQuantity`, `createdAt`, `updatedAt`) and run the migration.

**API:** Implement `GET /products` with an optional `?category=` query parameter that filters results. Implement `GET /products/:id`. Both endpoints are public (no auth required).

**Frontend:** 
- `/` — Home page with brand hero and a link/button to browse products.
- `/products` — Product listing page. Displays all products as cards (name, image, price, category). Includes a category filter UI (e.g. filter buttons for Hoodies, Tees, Cargo Pants, Sneakers, Caps, Bags). Products with `stockQuantity === 0` show an "Out of Stock" badge and a disabled "Add to Cart" button.
- `/products/:id` — Product detail page. Shows name, image, description, price, category, and stock status. "Add to Cart" button is disabled and shows "Out of Stock" when stock is zero.

The "Add to Cart" button exists on both pages in this slice but its click handler is wired up in the Cart slice (issues/004-cart.md). For now it can be rendered as a placeholder or left as a disabled/no-op button.

**Seed:** The seed script populates 12 products (2 per category: Hoodies, Tees, Cargo Pants, Sneakers, Caps, Bags) with realistic names, descriptions, prices, and `imageUrl` values pointing to `/images/*.jpg`. Static product images are added to `/frontend/public/images/`.

## Acceptance criteria
- [ ] `GET /products` returns all products as a JSON array
- [ ] `GET /products?category=Hoodies` returns only products in the Hoodies category
- [ ] `GET /products/:id` returns a single product or 404 if not found
- [ ] `/products` page renders all products as cards
- [ ] Clicking a category filter shows only products in that category
- [ ] Clicking "All" or clearing the filter shows all products
- [ ] Products with `stockQuantity === 0` show an "Out of Stock" badge
- [ ] The "Add to Cart" button is disabled on out-of-stock products
- [ ] `/products/:id` renders full product detail
- [ ] Product images load from `/images/*.jpg` (no broken images)
- [ ] `npx prisma db seed` creates 12 products across 6 categories
- [ ] Both endpoints return correct data with no auth required

## Blocked by
Blocked by issues/001-monorepo-scaffold.md
(Can be built in parallel with issues/002-customer-auth.md)

## User stories addressed
- User story 1 (home page)
- User story 2 (browse all products)
- User story 3 (filter by category)
- User story 4 (product card with name, price, image, category)
- User story 5 (out of stock badge and disabled button)
- User story 6 (product detail page)
- User story 7 (stock availability on detail page)

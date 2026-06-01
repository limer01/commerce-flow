## Parent PRD
issues/prd.md

## What to build
Deliver end-to-end admin product management: API endpoints and frontend. A logged-in admin should be able to create, edit, and delete products from a single management page, with the list updating immediately after each action.

**API:** Implement admin-only product mutation endpoints, each protected by both `authenticate` and `requireAdmin` middleware:
- `POST /products` — creates a new product with name, description, price (Decimal), imageUrl, category, and stockQuantity.
- `PUT /products/:id` — updates any fields on an existing product.
- `DELETE /products/:id` — hard-deletes a product. This is safe because of the `onDelete` rules established in the schema: `OrderItem → Product` is `SetNull` (order history is preserved via snapshotted `productName`/`priceAtPurchase`), and `CartItem → Product` is `Cascade` (the product is removed from any active carts). Deleting a product that appears in past orders does NOT corrupt or remove those orders. See PRD → Referential Integrity.

Note: `GET /products` and `GET /products/:id` were implemented in issues/003-product-browsing.md and remain unchanged. `price` is a `Decimal` and arrives as a JSON string on the frontend — parse before formatting.

**Frontend:**
- `/admin/products` (admin-only, guarded by `app/admin/layout.tsx` from issues/002-customer-auth.md) — displays a table of all products with columns for name, category, price, and stock quantity. Includes:
  - An "Add Product" button that opens a modal form with fields: name, description, price, imageUrl, category (dropdown of the 6 fixed categories), stockQuantity.
  - An "Edit" button per row that opens the same modal pre-filled with the product's current values.
  - A "Delete" button per row with a confirmation step before deletion.
  - The product list refreshes via React Query cache invalidation after every create, update, or delete.

## Acceptance criteria
- [ ] `POST /products` creates a product and returns it (admin only, 403 for non-admins)
- [ ] `PUT /products/:id` updates a product and returns the updated record (admin only)
- [ ] `DELETE /products/:id` deletes the product (admin only)
- [ ] Deleting a product that appears in a past order leaves the order intact (order history still shows the snapshotted name and price)
- [ ] Deleting a product removes it from any active carts (cascade)
- [ ] All three endpoints return 401 for unauthenticated requests
- [ ] All three endpoints return 403 for authenticated non-admin users
- [ ] `/admin/products` renders a table of all products
- [ ] "Add Product" button opens a modal form
- [ ] Submitting the create form adds the product and closes the modal
- [ ] "Edit" button opens the modal pre-filled with the product's data
- [ ] Submitting the edit form updates the product and closes the modal
- [ ] "Delete" button requires confirmation before deleting
- [ ] Product list updates immediately after create, edit, or delete (no page refresh)
- [ ] Form validation prevents submission with missing required fields
- [ ] Non-admin users are redirected away from `/admin/products`

## Blocked by
Blocked by issues/002-customer-auth.md and issues/003-product-browsing.md
(Can be built in parallel with issues/005-checkout-and-orders.md)

## User stories addressed
- User story 40 (admin views product list)
- User story 41 (admin creates product via modal)
- User story 42 (admin edits product via modal)
- User story 43 (admin deletes product)
- User story 44 (product list updates immediately after mutation)

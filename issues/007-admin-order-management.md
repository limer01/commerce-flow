## Parent PRD
issues/prd.md

## What to build
Deliver end-to-end admin order management: API endpoints and frontend. A logged-in admin should be able to view all customer orders and mark individual orders as completed.

**API:** Implement admin-only order endpoints, each protected by both `authenticate` and `requireAdmin` middleware:
- `GET /admin/orders` — returns all orders across all customers, ordered by `createdAt` descending. Each order includes the customer's name and email, order date, total price, status, and all order items with product names.
- `PUT /admin/orders/:id` — accepts `{ "status": "COMPLETED" }` in the request body and updates the order's status. Returns the updated order.

**Frontend:**
- `/admin/orders` (admin-only, guarded by `app/admin/layout.tsx`) — displays a table of all orders with columns for customer name, order date, total, and status. Each row has a "Mark as Completed" button that is disabled and visually distinct when the order is already `COMPLETED`. Clicking the button calls `PUT /admin/orders/:id` and updates the row status immediately via React Query cache invalidation — no page refresh required.

## Acceptance criteria
- [ ] `GET /admin/orders` returns all orders with customer name, email, date, total, status, and items
- [ ] `GET /admin/orders` returns 401 for unauthenticated requests
- [ ] `GET /admin/orders` returns 403 for authenticated non-admin users
- [ ] `PUT /admin/orders/:id` updates order status to `COMPLETED`
- [ ] `PUT /admin/orders/:id` returns 404 if the order does not exist
- [ ] `PUT /admin/orders/:id` returns 403 for non-admin users
- [ ] `/admin/orders` renders a table of all orders
- [ ] Each row shows customer name, date, total, and current status
- [ ] "Mark as Completed" button updates the order status in the UI without a page refresh
- [ ] The button is disabled for orders already in `COMPLETED` status
- [ ] Non-admin users are redirected away from `/admin/orders`

## Blocked by
Blocked by issues/005-checkout-and-orders.md and issues/006-admin-product-management.md

## User stories addressed
- User story 45 (admin views all orders with customer name, date, total, status)
- User story 46 (admin marks order as Completed)
- User story 47 (order status updates immediately in UI)

// Shared frontend types. Per the PRD, the frontend defines its own types
// independently of the backend (no shared types package).

export type Role = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

// price arrives as a string: the backend stores it as a Prisma Decimal, which
// serializes to a string in JSON to avoid float precision loss.
export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

// The fixed set of categories used by the listing-page filter UI (issue 003).
export const PRODUCT_CATEGORIES = [
  'Hoodies',
  'Tees',
  'Cargo Pants',
  'Sneakers',
  'Caps',
  'Bags',
] as const;

// A line in the cart, joined to its product (the API always includes product).
export interface CartItem {
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: Product;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

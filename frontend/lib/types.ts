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

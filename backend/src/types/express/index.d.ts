import type { Role } from '@prisma/client';

// Augment Express's Request so the `authenticate` middleware can attach the
// verified user's id and role for downstream handlers to read in a typed way.
declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userRole?: Role;
    }
  }
}

export {};

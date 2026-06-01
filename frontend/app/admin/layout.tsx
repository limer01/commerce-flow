'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';

// Protects every /admin/* route. Unauthenticated users are sent to /login;
// authenticated non-admins are sent home. While auth state loads we render a
// placeholder instead of the admin UI so protected content never flashes for
// an unauthorized user. Admin pages (products, orders) are added in later
// slices and render inside this guard.
export default function AdminLayout({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated, user } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace('/login');
    } else if (!isAdmin) {
      router.replace('/');
    }
  }, [isLoading, isAuthenticated, isAdmin, router]);

  if (isLoading || !isAuthenticated || !isAdmin) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10 text-sm text-muted-foreground">
        Checking access…
      </main>
    );
  }

  return <>{children}</>;
}

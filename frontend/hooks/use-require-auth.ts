'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';

// Guards a client page: once auth state has loaded, redirects unauthenticated
// users to /login. There is a brief flash of the protected page while loading
// (acceptable per the PRD); callers should render a spinner while isLoading.
// Used by /cart, /checkout, /orders in later slices.
export function useRequireAuth(): ReturnType<typeof useAuth> {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace('/login');
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  return auth;
}

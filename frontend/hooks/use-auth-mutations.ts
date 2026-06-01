'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { User } from '@/lib/types';
import { AUTH_QUERY_KEY } from './use-auth';

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

// All three mutations write/clear the httpOnly cookie server-side, then
// update the cached session so the nav and guards react immediately.
// On register/login we seed the cache directly with the returned user
// (avoids an extra /auth/me round-trip); logout clears it.

export function useRegister() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: RegisterInput) => {
      const res = await api.post<{ user: User }>('/auth/register', input);
      return res.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LoginInput) => {
      const res = await api.post<{ user: User }>('/auth/login', input);
      return res.data.user;
    },
    onSuccess: (user) => {
      queryClient.setQueryData(AUTH_QUERY_KEY, user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(AUTH_QUERY_KEY, null);
      // Drop any other user-scoped cached data (cart/orders in later slices).
      queryClient.invalidateQueries();
    },
  });
}

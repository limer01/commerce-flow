'use client';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { api } from '@/lib/axios';
import type { User } from '@/lib/types';

export const AUTH_QUERY_KEY = ['auth', 'me'] as const;

// Fetches the current session from GET /auth/me. A 401 is the normal
// "logged out" state, so it resolves to null rather than throwing — that
// keeps `isAuthenticated` clean and avoids React Query error/retry churn.
async function fetchMe(): Promise<User | null> {
  try {
    const res = await api.get<{ user: User }>('/auth/me');
    return res.data.user;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 401) {
      return null;
    }
    throw err;
  }
}

// Single source of truth for auth state across the app. Cached by React Query
// under AUTH_QUERY_KEY; mutations (login/register/logout) invalidate it.
export function useAuth(): {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
} {
  const { data, isLoading } = useQuery({
    queryKey: AUTH_QUERY_KEY,
    queryFn: fetchMe,
    retry: false,
    staleTime: 60_000,
  });

  return {
    user: data ?? null,
    isLoading,
    isAuthenticated: !!data,
  };
}

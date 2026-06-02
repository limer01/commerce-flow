'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Order } from '@/lib/types';
import { useAuth } from './use-auth';
import { CART_QUERY_KEY } from './use-cart';

export const ORDERS_QUERY_KEY = ['orders'] as const;

// The current user's order history (auth-gated, like the cart).
export function useOrders() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ORDERS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get<Order[]>('/orders');
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

// Places an order from the cart. On success the server has emptied the cart and
// created the order, so we refresh both caches (clears the nav badge, updates
// /orders). Errors (e.g. stock) propagate to the caller for inline display.
export function usePlaceOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await api.post<Order>('/orders');
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ORDERS_QUERY_KEY });
    },
  });
}

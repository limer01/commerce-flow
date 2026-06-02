'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Cart } from '@/lib/types';
import { useAuth } from './use-auth';

export const CART_QUERY_KEY = ['cart'] as const;

// Total number of items in the cart (sum of quantities) — used by the nav badge.
export function cartItemCount(cart: Cart | undefined | null): number {
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
}

// Loads the current user's cart. Gated on auth: the endpoint is 401 for guests,
// so we only fire it once logged in (keeps the nav badge quiet for visitors).
export function useCart() {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get<Cart>('/cart');
      return res.data;
    },
    enabled: isAuthenticated,
  });
}

// Every cart endpoint returns the full updated cart, so each mutation seeds the
// cache directly — the page and the nav badge update in one shot, no refetch.
export function useAddToCart() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { productId: number; quantity?: number }) => {
      const res = await api.post<Cart>('/cart/items', input);
      return res.data;
    },
    onSuccess: (cart) => queryClient.setQueryData(CART_QUERY_KEY, cart),
  });
}

export function useUpdateCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { itemId: number; quantity: number }) => {
      const res = await api.put<Cart>(`/cart/items/${input.itemId}`, {
        quantity: input.quantity,
      });
      return res.data;
    },
    onSuccess: (cart) => queryClient.setQueryData(CART_QUERY_KEY, cart),
  });
}

export function useRemoveCartItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: number) => {
      const res = await api.delete<Cart>(`/cart/items/${itemId}`);
      return res.data;
    },
    onSuccess: (cart) => queryClient.setQueryData(CART_QUERY_KEY, cart),
  });
}

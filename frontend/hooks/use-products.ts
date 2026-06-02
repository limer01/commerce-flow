'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Product } from '@/lib/types';

// Cache key namespace for product queries. `category` defaults to 'all' so the
// unfiltered listing and each filtered view are cached independently.
const PRODUCTS_KEY = 'products';

// Fetches the product list, optionally filtered by category via ?category=.
export function useProducts(category?: string) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'list', category ?? 'all'],
    queryFn: async () => {
      const res = await api.get<Product[]>('/products', {
        params: category ? { category } : undefined,
      });
      return res.data;
    },
  });
}

// Fetches a single product by id. Disabled until a valid positive id is known
// (e.g. while route params are still being parsed).
export function useProduct(id: number) {
  return useQuery({
    queryKey: [PRODUCTS_KEY, 'detail', id],
    queryFn: async () => {
      const res = await api.get<Product>(`/products/${id}`);
      return res.data;
    },
    enabled: Number.isInteger(id) && id > 0,
  });
}

// --- Admin product mutations (issue 006). Each invalidates the products
// namespace so every list/detail view refetches after a change. ---

export interface ProductInput {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  stockQuantity: number;
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: ProductInput) => {
      const res = await api.post<Product>('/products', input);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: ProductInput }) => {
      const res = await api.put<Product>(`/products/${id}`, input);
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [PRODUCTS_KEY] }),
  });
}

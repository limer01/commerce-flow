'use client';

import { useState } from 'react';
import { useProducts } from '@/hooks/use-products';
import { ProductCard } from '@/components/product-card';
import { Button } from '@/components/ui/button';
import { PRODUCT_CATEGORIES } from '@/lib/types';

export default function ProductsPage() {
  // `undefined` means "All": the hook then omits the ?category= param.
  const [category, setCategory] = useState<string | undefined>(undefined);
  const { data: products, isLoading, isError } = useProducts(category);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Products</h1>

      <div className="mb-8 flex flex-wrap gap-2">
        <Button
          variant={category === undefined ? 'default' : 'outline'}
          size="sm"
          onClick={() => setCategory(undefined)}
        >
          All
        </Button>
        {PRODUCT_CATEGORIES.map((c) => (
          <Button
            key={c}
            variant={category === c ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategory(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      {isLoading && <p className="text-muted-foreground">Loading products…</p>}

      {isError && (
        <p role="alert" className="text-destructive">
          Could not load products. Please try again.
        </p>
      )}

      {products && products.length === 0 && (
        <p className="text-muted-foreground">No products in this category yet.</p>
      )}

      {products && products.length > 0 && (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}

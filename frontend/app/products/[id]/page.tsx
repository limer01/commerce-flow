'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProduct } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const { data: product, isLoading, isError } = useProduct(id);

  if (isLoading) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p role="alert" className="mb-4 text-destructive">
          Product not found.
        </p>
        <Button asChild variant="outline">
          <Link href="/products">Back to products</Link>
        </Button>
      </main>
    );
  }

  const outOfStock = product.stockQuantity === 0;

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <Link
        href="/products"
        className="mb-6 inline-block text-sm text-muted-foreground hover:underline"
      >
        ← Back to products
      </Link>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {outOfStock && (
            <span className="absolute left-3 top-3 rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
              Out of Stock
            </span>
          )}
        </div>

        <div className="flex flex-col">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {product.category}
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-4 text-2xl font-semibold">{formatPrice(product.price)}</p>

          <p className="mt-6 leading-relaxed text-muted-foreground">
            {product.description}
          </p>

          <p className="mt-6 text-sm">
            {outOfStock ? (
              <span className="font-medium text-destructive">Out of stock</span>
            ) : (
              <span className="text-muted-foreground">
                In stock: {product.stockQuantity}
              </span>
            )}
          </p>

          <div className="mt-8">
            <Button
              type="button"
              size="lg"
              className="w-full sm:w-auto"
              disabled={outOfStock}
              aria-disabled={outOfStock}
            >
              {outOfStock ? 'Out of Stock' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

import Link from 'next/link';
import { AddToCartButton } from '@/components/add-to-cart-button';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';

// A single product tile used on the listing page. The whole card links to the
// detail page; the "Add to Cart" button is a disabled placeholder in this
// slice (wired up in issue 004) and is always disabled when out of stock.
export function ProductCard({ product }: { product: Product }) {
  const outOfStock = product.stockQuantity === 0;

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {outOfStock && (
            <span className="absolute left-2 top-2 rounded-md bg-destructive px-2 py-1 text-xs font-semibold text-destructive-foreground">
              Out of Stock
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {product.category}
        </p>
        <Link href={`/products/${product.id}`} className="font-medium hover:underline">
          {product.name}
        </Link>
        <p className="mt-1 text-lg font-semibold">{formatPrice(product.price)}</p>

        <AddToCartButton product={product} className="mt-3 w-full" />
      </div>
    </div>
  );
}

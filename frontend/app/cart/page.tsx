'use client';

import Link from 'next/link';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useCart, useUpdateCartItem, useRemoveCartItem } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const { data: cart, isLoading: cartLoading } = useCart();
  const updateItem = useUpdateCartItem();
  const removeItem = useRemoveCartItem();

  // While auth resolves (or we're mid-redirect for guests) show a placeholder.
  if (authLoading || !isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  const items = cart?.items ?? [];
  const grandTotal = items.reduce(
    (sum, item) => sum + item.quantity * Number(item.product.price),
    0
  );
  // Disable controls during any in-flight mutation to avoid racing the cache.
  const busy = updateItem.isPending || removeItem.isPending;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Your Cart</h1>

      {cartLoading && <p className="text-muted-foreground">Loading cart…</p>}

      {!cartLoading && items.length === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">Your cart is empty.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      )}

      {items.length > 0 && (
        <>
          <ul className="divide-y rounded-lg border">
            {items.map((item) => {
              const lineTotal = item.quantity * Number(item.product.price);
              return (
                <li key={item.id} className="flex items-center gap-4 p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="h-16 w-16 flex-shrink-0 rounded-md border object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/products/${item.productId}`}
                      className="font-medium hover:underline"
                    >
                      {item.product.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      {formatPrice(item.product.price)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Decrease quantity"
                      disabled={busy}
                      onClick={() =>
                        updateItem.mutate({ itemId: item.id, quantity: item.quantity - 1 })
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center tabular-nums" aria-label="Quantity">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label="Increase quantity"
                      disabled={busy}
                      onClick={() =>
                        updateItem.mutate({ itemId: item.id, quantity: item.quantity + 1 })
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="w-20 text-right font-semibold tabular-nums">
                    {formatPrice(lineTotal)}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove item"
                    disabled={busy}
                    onClick={() => removeItem.mutate(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-bold tabular-nums">{formatPrice(grandTotal)}</span>
          </div>

          <div className="mt-6 flex justify-end">
            <Button asChild size="lg">
              <Link href="/checkout">Proceed to Checkout</Link>
            </Button>
          </div>
        </>
      )}
    </main>
  );
}

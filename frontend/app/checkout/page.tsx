'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useCart } from '@/hooks/use-cart';
import { usePlaceOrder } from '@/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { getApiErrorMessage } from '@/lib/api-error';

export default function CheckoutPage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const { data: cart, isLoading: cartLoading } = useCart();
  const placeOrder = usePlaceOrder();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (authLoading || !isAuthenticated) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  const items = cart?.items ?? [];
  const total = items.reduce(
    (sum, item) => sum + item.quantity * Number(item.product.price),
    0
  );

  const onPlaceOrder = async () => {
    setError(null);
    try {
      await placeOrder.mutateAsync();
      router.push('/checkout/success');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not place your order'));
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Checkout</h1>

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
            {items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 p-4">
                <span className="min-w-0 flex-1 truncate">
                  {item.product.name}{' '}
                  <span className="text-muted-foreground">× {item.quantity}</span>
                </span>
                <span className="font-medium tabular-nums">
                  {formatPrice(item.quantity * Number(item.product.price))}
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex items-center justify-between">
            <span className="text-lg font-medium">Total</span>
            <span className="text-2xl font-bold tabular-nums">{formatPrice(total)}</span>
          </div>

          {error && (
            <p role="alert" className="mt-4 text-sm text-destructive">
              {error}
            </p>
          )}

          <Button
            type="button"
            size="lg"
            className="mt-6 w-full"
            disabled={placeOrder.isPending}
            onClick={onPlaceOrder}
          >
            {placeOrder.isPending ? 'Placing order…' : 'Place Order'}
          </Button>
        </>
      )}
    </main>
  );
}

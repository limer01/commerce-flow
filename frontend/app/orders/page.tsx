'use client';

import Link from 'next/link';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { useOrders } from '@/hooks/use-orders';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { OrderStatus } from '@/lib/types';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles =
    status === 'COMPLETED'
      ? 'bg-green-100 text-green-800'
      : 'bg-amber-100 text-amber-800';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>
      {status}
    </span>
  );
}

export default function OrdersPage() {
  const { isLoading: authLoading, isAuthenticated } = useRequireAuth();
  const { data: orders, isLoading: ordersLoading } = useOrders();

  if (authLoading || !isAuthenticated) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-muted-foreground">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold tracking-tight">Your Orders</h1>

      {ordersLoading && <p className="text-muted-foreground">Loading orders…</p>}

      {!ordersLoading && (orders?.length ?? 0) === 0 && (
        <div className="rounded-lg border p-8 text-center">
          <p className="text-muted-foreground">You haven&apos;t placed any orders yet.</p>
          <Button asChild className="mt-4">
            <Link href="/products">Browse products</Link>
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {orders?.map((order) => (
          <div key={order.id} className="rounded-lg border">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b p-4">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={order.status} />
                <span className="text-lg font-bold tabular-nums">
                  {formatPrice(order.totalPrice)}
                </span>
              </div>
            </div>

            <ul className="divide-y">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="min-w-0 flex-1 truncate">
                    {item.productName}{' '}
                    <span className="text-muted-foreground">× {item.quantity}</span>
                  </span>
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formatPrice(item.priceAtPurchase)} each
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}

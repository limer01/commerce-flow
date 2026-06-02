'use client';

import { useAdminOrders, useUpdateOrderStatus } from '@/hooks/use-orders';
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
    status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800';
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles}`}>{status}</span>
  );
}

export default function AdminOrdersPage() {
  const { data: orders, isLoading } = useAdminOrders();
  const updateStatus = useUpdateOrderStatus();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Order Management</h1>

      {isLoading && <p className="text-muted-foreground">Loading orders…</p>}

      {orders && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Order</th>
                <th className="p-3 font-medium">Customer</th>
                <th className="p-3 font-medium">Date</th>
                <th className="p-3 text-right font-medium">Total</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orders.map((order) => {
                const completed = order.status === 'COMPLETED';
                return (
                  <tr key={order.id}>
                    <td className="p-3">#{order.id}</td>
                    <td className="p-3">
                      <div>{order.user.name}</div>
                      <div className="text-xs text-muted-foreground">{order.user.email}</div>
                    </td>
                    <td className="p-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                    <td className="p-3 text-right tabular-nums">{formatPrice(order.totalPrice)}</td>
                    <td className="p-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant={completed ? 'outline' : 'default'}
                        size="sm"
                        disabled={completed || updateStatus.isPending}
                        onClick={() =>
                          updateStatus.mutate({ id: order.id, status: 'COMPLETED' })
                        }
                      >
                        {completed ? 'Completed' : 'Mark as Completed'}
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

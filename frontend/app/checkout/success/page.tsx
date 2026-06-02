import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Order confirmation. Reached after a successful POST /orders; the cart is
// already cleared server-side at this point.
export default function CheckoutSuccessPage() {
  return (
    <main className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 text-center">
      <CheckCircle2 className="mb-4 h-16 w-16 text-green-600" />
      <h1 className="text-3xl font-bold tracking-tight">Order placed!</h1>
      <p className="mt-4 text-muted-foreground">
        Thanks for your purchase. Your order has been received and is being
        processed. You can view it any time in your order history.
      </p>
      <div className="mt-8 flex gap-3">
        <Button asChild>
          <Link href="/products">Continue Shopping</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/orders">View Orders</Link>
        </Button>
      </div>
    </main>
  );
}

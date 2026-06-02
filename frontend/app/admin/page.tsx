import Link from 'next/link';
import { Button } from '@/components/ui/button';

// Admin landing page. Lives inside app/admin/layout.tsx, so it is only
// reachable by authenticated ADMIN users.
export default function AdminHome() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-bold">Admin</h1>
      <p className="mt-2 text-muted-foreground">Management panel.</p>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/admin/products">Manage Products</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin/orders">Manage Orders</Link>
        </Button>
      </div>
    </main>
  );
}

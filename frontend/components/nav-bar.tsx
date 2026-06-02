'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLogout } from '@/hooks/use-auth-mutations';
import { useCart, cartItemCount } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';

// Auth-aware navigation bar. Renders Login/Register when logged out and
// Orders/Logout (plus Admin for admins) when logged in. While auth state is
// still loading we render no auth controls to avoid a flash of the wrong set.
export function NavBar() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const logout = useLogout();
  const router = useRouter();
  const { data: cart } = useCart();
  const cartCount = cartItemCount(cart);

  const handleLogout = async () => {
    await logout.mutateAsync();
    router.push('/');
  };

  return (
    <header className="border-b">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Streetwear Store
        </Link>

        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/products">Products</Link>
          </Button>

          <Button variant="ghost" size="icon" asChild aria-label="Cart" className="relative">
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 text-xs font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>

          {isLoading ? null : isAuthenticated ? (
            <>
              <Button variant="ghost" asChild>
                <Link href="/orders">Orders</Link>
              </Button>
              {user?.role === 'ADMIN' && (
                <Button variant="ghost" asChild>
                  <Link href="/admin">Admin</Link>
                </Button>
              )}
              <Button
                variant="outline"
                onClick={handleLogout}
                disabled={logout.isPending}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

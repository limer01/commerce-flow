'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useAddToCart } from '@/hooks/use-cart';
import { Button, type ButtonProps } from '@/components/ui/button';
import type { Product } from '@/lib/types';

// Shared Add-to-Cart control for the listing card and detail page. Guests are
// sent to /login; logged-in users hit the cart mutation (which updates the nav
// badge via the shared cart cache). Disabled when the product is out of stock.
export function AddToCartButton({
  product,
  className,
  size,
}: {
  product: Product;
  className?: string;
  size?: ButtonProps['size'];
}) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const addToCart = useAddToCart();
  const outOfStock = product.stockQuantity === 0;

  const handleClick = () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    addToCart.mutate({ productId: product.id });
  };

  return (
    <Button
      type="button"
      className={className}
      size={size}
      disabled={outOfStock || isLoading || addToCart.isPending}
      aria-disabled={outOfStock}
      onClick={handleClick}
    >
      {outOfStock ? 'Out of Stock' : addToCart.isPending ? 'Adding…' : 'Add to Cart'}
    </Button>
  );
}

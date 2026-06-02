'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCreateProduct, useUpdateProduct, type ProductInput } from '@/hooks/use-products';
import { PRODUCT_CATEGORIES, type Product } from '@/lib/types';
import { getApiErrorMessage } from '@/lib/api-error';
import { cn } from '@/lib/utils';

const EMPTY: ProductInput = {
  name: '',
  description: '',
  price: '',
  imageUrl: '',
  category: PRODUCT_CATEGORIES[0],
  stockQuantity: 0,
};

// Add/Edit product modal. `product` null => create; otherwise edit pre-filled.
export function ProductFormModal({
  open,
  product,
  onClose,
}: {
  open: boolean;
  product: Product | null;
  onClose: () => void;
}) {
  const isEdit = product !== null;
  const create = useCreateProduct();
  const update = useUpdateProduct();
  const [form, setForm] = useState<ProductInput>(EMPTY);
  const [error, setError] = useState<string | null>(null);

  // Reset the form whenever the modal opens (pre-filled for edit, blank for create).
  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(
      product
        ? {
            name: product.name,
            description: product.description,
            price: String(product.price),
            imageUrl: product.imageUrl,
            category: product.category,
            stockQuantity: product.stockQuantity,
          }
        : EMPTY
    );
  }, [open, product]);

  const pending = create.isPending || update.isPending;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit && product) {
        await update.mutateAsync({ id: product.id, input: form });
      } else {
        await create.mutateAsync(form);
      }
      onClose();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save product'));
    }
  };

  const fieldClass =
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2';

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Product' : 'Add Product'}>
      <form onSubmit={onSubmit} className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="p-name">Name</Label>
          <Input
            id="p-name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-description">Description</Label>
          <textarea
            id="p-description"
            className={cn(fieldClass, 'h-20 resize-y')}
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="p-price">Price</Label>
            <Input
              id="p-price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-stock">Stock quantity</Label>
            <Input
              id="p-stock"
              type="number"
              min="0"
              step="1"
              value={form.stockQuantity}
              onChange={(e) => setForm((f) => ({ ...f, stockQuantity: Number(e.target.value) }))}
              required
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-image">Image URL</Label>
          <Input
            id="p-image"
            value={form.imageUrl}
            onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))}
            placeholder="/images/example.jpg"
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="p-category">Category</Label>
          <select
            id="p-category"
            className={fieldClass}
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            required
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

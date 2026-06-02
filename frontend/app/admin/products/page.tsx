'use client';

import { useState } from 'react';
import { useProducts, useDeleteProduct } from '@/hooks/use-products';
import { ProductFormModal } from '@/components/product-form-modal';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import type { Product } from '@/lib/types';

export default function AdminProductsPage() {
  const { data: products, isLoading } = useProducts();
  const del = useDeleteProduct();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    await del.mutateAsync(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Product Management</h1>
        <Button onClick={openCreate}>Add Product</Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading products…</p>}

      {products && (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Category</th>
                <th className="p-3 text-right font-medium">Price</th>
                <th className="p-3 text-right font-medium">Stock</th>
                <th className="p-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="p-3">{product.name}</td>
                  <td className="p-3 text-muted-foreground">{product.category}</td>
                  <td className="p-3 text-right tabular-nums">{formatPrice(product.price)}</td>
                  <td className="p-3 text-right tabular-nums">{product.stockQuantity}</td>
                  <td className="p-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(product)}>
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteTarget(product)}
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-muted-foreground">
                    No products yet. Click &ldquo;Add Product&rdquo; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <ProductFormModal open={formOpen} product={editing} onClose={() => setFormOpen(false)} />

      <Modal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        title="Delete product"
      >
        <p className="text-sm text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="font-medium text-foreground">{deleteTarget?.name}</span>? This cannot be
          undone. Past orders keep their record; the product is removed from any active carts.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={del.isPending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={del.isPending}>
            {del.isPending ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </Modal>
    </main>
  );
}

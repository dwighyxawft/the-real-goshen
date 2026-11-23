'use client';

import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { listAdminProducts, publishProduct, deleteProduct, duplicateProduct } from '@/lib/api/products';
import { formatNaira } from '@/lib/format';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', q, page],
    queryFn: () => listAdminProducts({ q, page, limit: 50 }),
    retry: false,
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) => publishProduct(id, isPublished),
    onMutate: async ({ id, isPublished }) => {
      await queryClient.cancelQueries({ queryKey: ['admin-products', q, page] });
      const prev = queryClient.getQueryData<{ items: any[] }>(['admin-products', q, page]);
      if (prev) {
        queryClient.setQueryData(['admin-products', q, page], {
          ...prev,
          items: prev.items.map((p) => p.id === id ? { ...p, isPublished } : p),
        });
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => { if (ctx?.prev) queryClient.setQueryData(['admin-products', q, page], ctx.prev); toast.error('Failed to update'); },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product deleted'); },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to delete'),
  });

  const duplicateMutation = useMutation({
    mutationFn: duplicateProduct,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-products'] }); toast.success('Product duplicated'); },
  });

  return (
    <AdminLayout title="Products" eyebrow="Keep your collection fresh and easy to browse">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18, flexWrap: 'wrap', gap: 12 }}>
        <form className="search-box" onSubmit={(e) => { e.preventDefault(); setPage(1); }} style={{ maxWidth: 320 }}>
          <Search size={17} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" aria-label="Search products" />
        </form>
        <Link href="/admin/products/new" className="button button-dark"><Plus size={16} /> New product</Link>
      </div>
      <section className="admin-card">
        {isLoading ? (
          <div className="skeleton" style={{ height: 300, borderRadius: 12 }} />
        ) : data?.items.length ? (
          data.items.map((product) => (
            <div className="admin-row" key={product.id}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                {product.coverImage && <img src={product.coverImage} alt={product.name} width={48} height={48} style={{ borderRadius: 8, objectFit: 'cover' }} />}
                <div>
                  <strong>{product.name}</strong>
                  <div className="helper">{product.category?.name ?? 'Uncategorised'} · {formatNaira(product.price)} · {product.availability === 'preorder' ? 'Preorder' : 'Ready stock'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  className={`status-chip ${product.isPublished ? 'green' : ''}`}
                  style={{ border: 'none', cursor: 'pointer', background: 'none' }}
                  onClick={() => publishMutation.mutate({ id: product.id, isPublished: !product.isPublished })}
                >
                  {product.isPublished ? 'Published' : 'Draft'}
                </button>
                <Link href={`/admin/products/${product.id}`} className="text-link">Edit</Link>
                <button onClick={() => { if (confirm(`Duplicate "${product.name}"?`)) duplicateMutation.mutate(product.id); }} className="text-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>Duplicate</button>
                <button onClick={() => { if (confirm(`Delete "${product.name}"? This cannot be undone.`)) deleteMutation.mutate(product.id); }} className="text-link" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}>Delete</button>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state"><h2>No products yet</h2><p>Create your first product to start selling.</p><Link href="/admin/products/new" className="button button-dark">New product</Link></div>
        )}
      </section>
    </AdminLayout>
  );
}

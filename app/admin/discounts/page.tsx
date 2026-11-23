'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { listAdminDiscounts, createDiscount, toggleDiscount, deleteDiscount } from '@/lib/api/discounts';
import { listAdminProducts } from '@/lib/api/products';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';

export default function DiscountsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', scope: 'all' as 'all' | 'product', productId: '', percentage: 10, startsAt: '', endsAt: '' });

  const { data: discounts } = useQuery({ queryKey: ['admin-discounts'], queryFn: listAdminDiscounts, retry: false });
  const { data: products } = useQuery({ queryKey: ['admin-products-all'], queryFn: () => listAdminProducts({ page: 1, limit: 100 }), retry: false });

  const createMutation = useMutation({
    mutationFn: () => createDiscount({
      name: form.name,
      scope: form.scope,
      productId: form.scope === 'product' ? form.productId : null,
      percentage: form.percentage,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
      isActive: true,
    }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-discounts'] }); toast.success('Discount created'); setShowForm(false); setForm({ name: '', scope: 'all', productId: '', percentage: 10, startsAt: '', endsAt: '' }); },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to create discount'),
  });

  const toggleMutation = useMutation({
    mutationFn: toggleDiscount,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-discounts'] }); toast.success('Discount toggled'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDiscount,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-discounts'] }); toast.success('Discount deleted'); },
  });

  return (
    <AdminLayout title="Discounts" eyebrow="Run sales on one product or everything">
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 18 }}>
        <button className="button button-dark" onClick={() => setShowForm(!showForm)}>New discount</button>
      </div>
      {showForm && (
        <section className="admin-card" style={{ marginBottom: 18 }}>
          <h2>Create discount</h2>
          <div className="field"><label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Weekend sale" /></div>
          <div className="field">
            <label>Scope</label>
            <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value as 'all' | 'product' })}>
              <option value="all">All products</option>
              <option value="product">Single product</option>
            </select>
          </div>
          {form.scope === 'product' && (
            <div className="field">
              <label>Product</label>
              <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })}>
                <option value="">Select a product</option>
                {products?.items.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}
          <div className="field"><label>Percentage (1-90)</label><input type="number" min={1} max={90} value={form.percentage} onChange={(e) => setForm({ ...form, percentage: parseInt(e.target.value) || 1 })} /></div>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}><label>Starts at</label><input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} /></div>
            <div className="field" style={{ flex: 1 }}><label>Ends at</label><input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} /></div>
          </div>
          <button className="button button-dark" onClick={() => createMutation.mutate()} disabled={!form.name || !form.startsAt || !form.endsAt}>Create discount</button>
        </section>
      )}
      <section className="admin-card">
        {discounts?.items.length ? (
          discounts.items.map((d) => (
            <div className="admin-row" key={d.id}>
              <div><strong>{d.name}</strong><div className="helper">{d.scope === 'all' ? 'All products' : d.product?.name ?? 'Single product'}</div></div>
              <span className="badge discount">−{d.percentage}%</span>
              <span className={`status-chip ${d.state === 'running' ? 'green' : ''}`}>{d.state}</span>
              <button className="text-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => toggleMutation.mutate(d.id)}>{d.isActive ? 'Disable' : 'Enable'}</button>
              <button className="text-link" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }} onClick={() => { if (confirm(`Delete "${d.name}"?`)) deleteMutation.mutate(d.id); }}>Delete</button>
            </div>
          ))
        ) : (
          <div className="empty-state"><h2>No discounts yet</h2><p>Create a discount to run a sale.</p></div>
        )}
      </section>
    </AdminLayout>
  );
}

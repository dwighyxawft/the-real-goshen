'use client';

import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { getAdminProduct, createProduct, updateProduct } from '@/lib/api/products';
import { listAllCategories } from '@/lib/api/categories';
import { uploadImage } from '@/lib/api/account';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';
import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import Image from 'next/image';

export default function ProductForm() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string | undefined;
  const isNew = !id || id === 'new';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<Record<string, any>>({
    name: '', description: '', price: 0, categoryId: '', availability: 'preorder',
    leadTimeWeeksMin: 4, leadTimeWeeksMax: 8, stockStatus: 'in_stock', isPublished: false, isFeatured: false,
    imageKeys: [] as string[],
  });
  const [loaded, setLoaded] = useState(false);

  const { data: product } = useQuery({
    queryKey: ['admin-product', id],
    queryFn: () => getAdminProduct(id!),
    enabled: !isNew,
    retry: false,
  });

  const { data: cats } = useQuery({ queryKey: ['all-categories'], queryFn: listAllCategories, retry: false });

  if (product && !loaded) {
    setForm({
      name: product.name, description: product.description, price: product.price,
      categoryId: product.categoryId ?? '', availability: product.availability,
      leadTimeWeeksMin: product.leadTimeWeeksMin ?? 4, leadTimeWeeksMax: product.leadTimeWeeksMax ?? 8,
      stockStatus: product.stockStatus, isPublished: product.isPublished, isFeatured: product.isFeatured,
      imageKeys: product.imageKeys ?? [],
    });
    setLoaded(true);
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description,
        price: Number(form.price),
        categoryId: form.categoryId || null,
        availability: form.availability,
        leadTimeWeeksMin: form.availability === 'preorder' ? Number(form.leadTimeWeeksMin) : null,
        leadTimeWeeksMax: form.availability === 'preorder' ? Number(form.leadTimeWeeksMax) : null,
        stockStatus: form.availability === 'ready_stock' ? form.stockStatus : 'in_stock',
        isPublished: form.isPublished,
        isFeatured: form.isFeatured,
        images: form.imageKeys,
      };
      if (isNew) return createProduct(payload);
      return updateProduct(id!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success(isNew ? 'Product created' : 'Product updated');
      router.push('/admin/products');
    },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to save'),
  });

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  async function handleUpload(files: FileList) {
    for (const file of Array.from(files)) {
      try {
        const result = await uploadImage('products', file);
        set('imageKeys', [...form.imageKeys, result.key]);
      } catch (err) {
        toast.error(`Failed to upload ${file.name}`);
      }
    }
  }

  return (
    <AdminLayout title={isNew ? 'New product' : 'Edit product'} eyebrow={isNew ? 'Create a new piece' : 'Update this piece'}>
      <section className="admin-card" style={{ maxWidth: 760 }}>
        <h2>Details</h2>
        <div className="field"><label>Name</label><input value={form.name} onChange={(e) => set('name', e.target.value)} /></div>
        <div className="field"><label>Description</label><textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={5} /></div>
        <div className="field"><label>Price (NGN)</label><input type="number" value={form.price} onChange={(e) => set('price', e.target.value)} /></div>
        <div className="field">
          <label>Category</label>
          <select value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            <option value="">Uncategorised</option>
            {cats?.items.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label>Availability</label>
          <select value={form.availability} onChange={(e) => set('availability', e.target.value)}>
            <option value="preorder">Preorder</option>
            <option value="ready_stock">Ready stock</option>
          </select>
        </div>
        {form.availability === 'preorder' ? (
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="field" style={{ flex: 1 }}><label>Lead time min (weeks)</label><input type="number" value={form.leadTimeWeeksMin} onChange={(e) => set('leadTimeWeeksMin', e.target.value)} /></div>
            <div className="field" style={{ flex: 1 }}><label>Lead time max (weeks)</label><input type="number" value={form.leadTimeWeeksMax} onChange={(e) => set('leadTimeWeeksMax', e.target.value)} /></div>
          </div>
        ) : (
          <div className="field">
            <label>Stock status</label>
            <select value={form.stockStatus} onChange={(e) => set('stockStatus', e.target.value)}>
              <option value="in_stock">In stock</option>
              <option value="limited">Limited</option>
              <option value="out_of_stock">Out of stock</option>
            </select>
          </div>
        )}
        <div className="field">
          <label><input type="checkbox" checked={form.isPublished} onChange={(e) => set('isPublished', e.target.checked)} /> Published</label>
          <label style={{ marginLeft: 16 }}><input type="checkbox" checked={form.isFeatured} onChange={(e) => set('isFeatured', e.target.checked)} /> Featured</label>
        </div>

        <h2 style={{ marginTop: 28 }}>Images</h2>
        <p className="helper">First image is the cover. Upload up to 8 images.</p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 12 }}>
          {form.imageKeys.map((key: string, i: number) => (
            <div key={key} style={{ position: 'relative', width: 96, height: 96 }}>
              <Image src={`/api/admin/uploads?preview=${encodeURIComponent(key)}`} alt={`Image ${i + 1}`} width={96} height={96} style={{ borderRadius: 8, objectFit: 'cover', width: '100%', height: '100%' }} unoptimized />
              {i === 0 && <span style={{ position: 'absolute', top: 4, left: 4, fontSize: 10, background: 'var(--gold-text)', color: '#fff', padding: '2px 6px', borderRadius: 4 }}>Cover</span>}
              <button onClick={() => set('imageKeys', form.imageKeys.filter((_: string, idx: number) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={12} /></button>
            </div>
          ))}
          {form.imageKeys.length < 8 && (
            <button onClick={() => fileInputRef.current?.click()} style={{ width: 96, height: 96, borderRadius: 8, border: '2px dashed var(--border)', background: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: 'var(--muted)' }}>
              <Upload size={20} />
              <span style={{ fontSize: 11 }}>Upload</span>
            </button>
          )}
        </div>
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => e.target.files && handleUpload(e.target.files)} />

        <div style={{ marginTop: 28, display: 'flex', gap: 12 }}>
          <button className="button button-dark" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending || !form.name}>{saveMutation.isPending ? 'Saving...' : 'Save product'}</button>
          <button className="button" onClick={() => router.push('/admin/products')}>Cancel</button>
        </div>
      </section>
    </AdminLayout>
  );
}

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { listAdminFaqs, createFaq, updateFaq, deleteFaq } from '@/lib/api/faqs';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminFaqsPage() {
  const queryClient = useQueryClient();
  const [newQ, setNewQ] = useState('');
  const [newA, setNewA] = useState('');

  const { data: faqs } = useQuery({ queryKey: ['admin-faqs'], queryFn: listAdminFaqs, retry: false });

  const createMutation = useMutation({
    mutationFn: () => createFaq(newQ, newA),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-faqs'] }); toast.success('FAQ created'); setNewQ(''); setNewA(''); },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ question: string; answer: string; isPublished: boolean }> }) => updateFaq(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-faqs'] }); toast.success('FAQ updated'); },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-faqs'] }); toast.success('FAQ deleted'); },
  });

  return (
    <AdminLayout title="FAQs" eyebrow="Manage your frequently asked questions">
      <section className="admin-card" style={{ maxWidth: 760, marginBottom: 18 }}>
        <h2>Add a new FAQ</h2>
        <div className="field"><label>Question</label><input value={newQ} onChange={(e) => setNewQ(e.target.value)} placeholder="How do preorders work?" /></div>
        <div className="field"><label>Answer</label><textarea value={newA} onChange={(e) => setNewA(e.target.value)} placeholder="Preorders usually arrive in about 4 to 8 weeks..." /></div>
        <button className="button button-dark" onClick={() => createMutation.mutate()} disabled={!newQ || !newA}><Plus size={16} /> Add FAQ</button>
      </section>
      <section className="admin-card" style={{ maxWidth: 760 }}>
        {faqs?.items.length ? (
          faqs.items.map((faq) => (
            <div className="admin-row" key={faq.id} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <strong>{faq.question}</strong>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className={`status-chip ${faq.isPublished ? 'green' : ''}`} style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => updateMutation.mutate({ id: faq.id, data: { isPublished: !faq.isPublished } })}>{faq.isPublished ? 'Published' : 'Draft'}</button>
                  <button onClick={() => { if (confirm('Delete this FAQ?')) deleteMutation.mutate(faq.id); }} className="text-link" style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--danger)' }}><Trash2 size={14} /></button>
                </div>
              </div>
              <p className="helper" style={{ marginTop: 6 }}>{faq.answer}</p>
            </div>
          ))
        ) : (
          <div className="empty-state"><h2>No FAQs yet</h2><p>Add your first question above.</p></div>
        )}
      </section>
    </AdminLayout>
  );
}

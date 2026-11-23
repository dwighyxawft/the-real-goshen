'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { getAdminContact, updateContactStatus, addReply, resendReply } from '@/lib/api/contacts';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';
import { useState } from 'react';
import { Check, RotateCw } from 'lucide-react';

export default function ContactDetail() {
  const params = useParams();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const [replyMsg, setReplyMsg] = useState('');

  const { data: contact, isLoading } = useQuery({
    queryKey: ['admin-contact', id],
    queryFn: () => getAdminContact(id),
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: (status: string) => updateContactStatus(id, status),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-contact', id] }); queryClient.invalidateQueries({ queryKey: ['admin-contacts'] }); toast.success('Status updated'); },
  });

  const replyMutation = useMutation({
    mutationFn: () => addReply(id, replyMsg),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-contact', id] }); toast.success('Reply sent'); setReplyMsg(''); },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to send reply'),
  });

  const resendMutation = useMutation({
    mutationFn: (replyId: string) => resendReply(id, replyId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-contact', id] }); toast.success('Reply resent'); },
  });

  if (isLoading) return <AdminLayout title="Loading..." eyebrow="Message"><div className="skeleton" style={{ height: 400, borderRadius: 16 }} /></AdminLayout>;
  if (!contact) return <AdminLayout title="Not found" eyebrow="Message"><div className="empty-state"><h2>Message not found</h2><Link href="/admin/contacts" className="button button-dark">Back to messages</Link></div></AdminLayout>;

  return (
    <AdminLayout title={contact.name} eyebrow={contact.subject}>
      <div className="admin-columns">
        <section className="admin-card">
          <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
            <select value={contact.status} onChange={(e) => statusMutation.mutate(e.target.value)}>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="replied">Replied</option>
              <option value="closed">Closed</option>
            </select>
            {contact.status !== 'closed' ? (
              <button className="button" onClick={() => statusMutation.mutate('closed')}>Close</button>
            ) : (
              <button className="button" onClick={() => statusMutation.mutate('new')}>Reopen</button>
            )}
          </div>
          <div style={{ padding: 20, borderRadius: 16, background: '#faf8f4', marginBottom: 20 }}>
            <strong>{contact.name}</strong>
            <p style={{ whiteSpace: 'pre-line', color: 'var(--muted)', marginTop: 8 }}>{contact.message}</p>
            <span className="helper">{new Date(contact.createdAt).toLocaleString()}</span>
          </div>
          {contact.replies.map((reply) => (
            <div key={reply.id} style={{ padding: 16, borderRadius: 12, background: 'var(--cream)', marginBottom: 12, borderLeft: '3px solid var(--gold-text)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>Reply</strong>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {reply.emailSent ? <span className="status-chip green" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Check size={12} /> Emailed</span> : <span className="status-chip">Not sent</span>}
                  {!reply.emailSent && <button onClick={() => resendMutation.mutate(reply.id)} className="text-link" style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><RotateCw size={12} /> Retry</button>}
                </div>
              </div>
              <p style={{ whiteSpace: 'pre-line', color: 'var(--muted)', marginTop: 8 }}>{reply.message}</p>
              <span className="helper">{new Date(reply.createdAt).toLocaleString()}</span>
            </div>
          ))}
          <div className="field" style={{ marginTop: 24 }}>
            <label htmlFor="reply">Reply to {contact.name}</label>
            <textarea id="reply" value={replyMsg} onChange={(e) => setReplyMsg(e.target.value)} placeholder="Write your reply. It will be emailed." />
          </div>
          <button className="button button-dark" onClick={() => replyMutation.mutate()} disabled={!replyMsg || replyMutation.isPending}>{replyMutation.isPending ? 'Sending...' : 'Send reply'}</button>
        </section>
        <aside className="admin-card">
          <h2>Contact details</h2>
          <p className="helper">Email</p>
          <strong>{contact.email}</strong>
          {contact.phone && <><p className="helper" style={{ marginTop: 18 }}>Phone</p><strong>{contact.phone}</strong></>}
          <p className="helper" style={{ marginTop: 18 }}>Received</p>
          <strong>{new Date(contact.createdAt).toLocaleString()}</strong>
          <p className="helper" style={{ marginTop: 18 }}>Auto-reply sent</p>
          <strong>{contact.autoReplySent ? 'Yes' : 'No'}</strong>
        </aside>
      </div>
      <Link href="/admin/contacts" className="text-link" style={{ display: 'block', marginTop: 20 }}>&larr; Back to messages</Link>
    </AdminLayout>
  );
}

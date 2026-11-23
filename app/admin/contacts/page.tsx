'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { listAdminContacts } from '@/lib/api/contacts';

const FILTERS = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'replied', label: 'Replied' },
  { value: 'closed', label: 'Closed' },
] as const;

export default function ContactsPage() {
  const [status, setStatus] = useState('');
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-contacts', status, q],
    queryFn: () => listAdminContacts({ status: status || undefined, q: q || undefined, page: 1, limit: 50 }),
    retry: false,
  });

  return (
    <AdminLayout title="Messages" eyebrow="Stay close to your customers">
      <div className="filter-chips" style={{ marginBottom: 18 }}>
        {FILTERS.map((f) => (
          <button key={f.value} className={`chip ${status === f.value ? 'active' : ''}`} onClick={() => setStatus(f.value)}>{f.label}</button>
        ))}
      </div>
      <section className="admin-card">
        {isLoading ? (
          <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
        ) : data?.items.length ? (
          data.items.map((contact) => (
            <Link href={`/admin/contacts/${contact.id}`} className="admin-row" key={contact.id}>
              <div>
                <strong>{contact.name}</strong>
                <div className="helper">{contact.subject}</div>
              </div>
              <div style={{ flex: 1, color: 'var(--muted)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{contact.message}</div>
              <span className={`status-chip ${contact.status !== 'new' ? 'green' : ''}`}>{contact.status}</span>
            </Link>
          ))
        ) : (
          <div className="empty-state"><h2>No messages yet</h2><p>When customers contact you, their messages appear here.</p></div>
        )}
      </section>
    </AdminLayout>
  );
}

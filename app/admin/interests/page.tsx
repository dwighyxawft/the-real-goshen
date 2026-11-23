'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { listAdminInterests } from '@/lib/api/interests';
import { formatNaira } from '@/lib/format';

const TABS = [
  { value: 'today', label: 'Today' },
  { value: 'past', label: 'Past' },
  { value: 'all', label: 'All' },
] as const;

export default function InterestsPage() {
  const [tab, setTab] = useState<string>('today');
  const [q, setQ] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-interests', tab, q],
    queryFn: () => listAdminInterests({ tab, q }),
    retry: false,
  });

  return (
    <AdminLayout title="Customer interests" eyebrow="People who sent you their picks">
      <div className="filter-chips" style={{ marginBottom: 18 }}>
        {TABS.map((t) => (
          <button key={t.value} className={`chip ${tab === t.value ? 'active' : ''}`} onClick={() => setTab(t.value)}>
            {t.label} · {data?.tabCounts ? (t.value === 'today' ? data.tabCounts.today : t.value === 'past' ? data.tabCounts.past : data.tabCounts.all) : 0}
          </button>
        ))}
      </div>
      <section className="admin-card">
        {isLoading ? (
          <div className="skeleton" style={{ height: 200, borderRadius: 12 }} />
        ) : data?.items.length ? (
          data.items.map((interest) => (
            <Link href={`/admin/interests/${interest.id}`} className="admin-row" key={interest.id}>
              <div>
                <strong>{interest.customerName}</strong>
                <div className="helper">{interest.reference} · {interest.customerPhone}</div>
              </div>
              <strong>{formatNaira(interest.totalEstimate)}</strong>
              <span className={`status-chip ${interest.status === 'completed' ? 'green' : interest.status === 'cancelled' ? '' : ''}`}>{interest.status}</span>
            </Link>
          ))
        ) : (
          <div className="empty-state"><h2>No interests here yet</h2><p>When customers submit their picks, they appear here.</p></div>
        )}
      </section>
    </AdminLayout>
  );
}

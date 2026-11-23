'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { getAdminSettings, updateSettings } from '@/lib/api/settings';
import { sendEmailTest } from '@/lib/api/account';
import { toast } from 'sonner';
import { ApiError } from '@/lib/api/client';

const EMAIL_TEMPLATES = [
  { value: 'interest_customer', label: 'Interest — Customer confirmation' },
  { value: 'interest_store', label: 'Interest — Store notification' },
  { value: 'reminder', label: 'Interest — Reminder' },
  { value: 'contact_autoreply', label: 'Contact — Auto-reply' },
  { value: 'contact_store', label: 'Contact — Store notification' },
  { value: 'contact_reply', label: 'Contact — Admin reply' },
];

const TABS = [
  { value: 'store', label: 'Store' },
  { value: 'homepage', label: 'Homepage' },
  { value: 'about', label: 'About' },
  { value: 'email', label: 'Email previews' },
] as const;

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<string>('store');
  const [form, setForm] = useState<Record<string, any>>({});
  const [loaded, setLoaded] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const result = await getAdminSettings();
      if (!loaded) { setForm(result); setLoaded(true); }
      return result;
    },
    retry: false,
  });

  const saveMutation = useMutation({
    mutationFn: () => updateSettings(form),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-settings'] }); queryClient.invalidateQueries({ queryKey: ['public-settings'] }); toast.success('Settings saved'); },
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to save'),
  });

  const emailTestMutation = useMutation({
    mutationFn: (template: string) => sendEmailTest(template),
    onSuccess: (data) => toast.success(`Test sent via ${data.provider}`),
    onError: (err) => toast.error(err instanceof ApiError ? err.message : 'Failed to send test'),
  });

  const set = (key: string, value: any) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <AdminLayout title="Settings" eyebrow="Keep your shop details current">
      <div className="filter-chips" style={{ marginBottom: 18 }}>
        {TABS.map((t) => <button key={t.value} className={`chip ${tab === t.value ? 'active' : ''}`} onClick={() => setTab(t.value)}>{t.label}</button>)}
      </div>
      <section className="admin-card" style={{ maxWidth: 760 }}>
        {tab === 'store' && (
          <>
            <h2>Store details</h2>
            <div className="field"><label>WhatsApp number</label><input value={form.whatsappNumber ?? ''} onChange={(e) => set('whatsappNumber', e.target.value)} /><span className="helper">Appears in emails, on the website, and in reminders.</span></div>
            <div className="field"><label>Store email</label><input value={form.storeEmail ?? ''} onChange={(e) => set('storeEmail', e.target.value)} /></div>
            <div className="field"><label>Default preorder lead time</label><div style={{ display: 'flex', gap: 10 }}><input type="number" value={form.defaultLeadTimeWeeksMin ?? 4} onChange={(e) => set('defaultLeadTimeWeeksMin', parseInt(e.target.value) || 4)} /><input type="number" value={form.defaultLeadTimeWeeksMax ?? 8} onChange={(e) => set('defaultLeadTimeWeeksMax', parseInt(e.target.value) || 8)} /></div></div>
            <div className="field"><label>Preorder note</label><textarea value={form.preorderNote ?? ''} onChange={(e) => set('preorderNote', e.target.value)} placeholder="Add your payment or deposit terms here..." /></div>
            <div className="field"><label>Instagram URL</label><input value={form.instagramUrl ?? ''} onChange={(e) => set('instagramUrl', e.target.value)} /></div>
            <div className="field"><label>TikTok URL</label><input value={form.tiktokUrl ?? ''} onChange={(e) => set('tiktokUrl', e.target.value)} /></div>
            <div className="field"><label>Facebook URL</label><input value={form.facebookUrl ?? ''} onChange={(e) => set('facebookUrl', e.target.value)} /></div>
            <div className="field"><label>Business hours</label><input value={form.businessHours ?? ''} onChange={(e) => set('businessHours', e.target.value)} placeholder="Mon – Sat · 9am – 6pm" /></div>
            <div className="field"><label>Address</label><input value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} /></div>
            <button className="button button-dark" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save changes</button>
          </>
        )}
        {tab === 'homepage' && (
          <>
            <h2>Homepage</h2>
            <div className="field"><label>Hero headline</label><input value={form.heroHeadline ?? ''} onChange={(e) => set('heroHeadline', e.target.value)} /></div>
            <div className="field"><label>Hero subheadline</label><textarea value={form.heroSubheadline ?? ''} onChange={(e) => set('heroSubheadline', e.target.value)} /></div>
            <div className="field"><label>Announcement text</label><input value={form.announcementText ?? ''} onChange={(e) => set('announcementText', e.target.value)} /></div>
            <div className="field"><label><input type="checkbox" checked={form.announcementActive ?? false} onChange={(e) => set('announcementActive', e.target.checked)} /> Announcement bar active</label></div>
            <button className="button button-dark" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save changes</button>
          </>
        )}
        {tab === 'about' && (
          <>
            <h2>About page</h2>
            <div className="field"><label>About text</label><textarea value={form.aboutBody ?? ''} onChange={(e) => set('aboutBody', e.target.value)} rows={8} /></div>
            <button className="button button-dark" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>Save changes</button>
          </>
        )}
        {tab === 'email' && (
          <>
            <h2>Email previews</h2>
            <p className="helper">Preview each email template in your browser or send yourself a test.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
              {EMAIL_TEMPLATES.map((t) => (
                <div key={t.value} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                  <span>{t.label}</span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`/api/admin/email-preview?template=${t.value}`} target="_blank" rel="noopener noreferrer" className="text-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }}>Preview</a>
                    <button className="text-link" style={{ border: 'none', background: 'none', cursor: 'pointer' }} onClick={() => emailTestMutation.mutate(t.value)} disabled={emailTestMutation.isPending}>Send test</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>
    </AdminLayout>
  );
}

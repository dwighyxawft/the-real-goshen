'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { getSetupStatus, setup as setupAdmin } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function AdminSetup() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getSetupStatus().then((data) => {
      if (!data.needsSetup) router.replace('/admin/login');
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      await setupAdmin({
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        secret: formData.get('secret') as string,
      });
      router.push('/admin');
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return <div style={{ minHeight: '100vh', background: 'var(--ink)' }} />;

  return (
    <main className="admin-login" style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <form className="login-card" onSubmit={submit} style={{ maxWidth: 420, width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Image src="/trg-logo-600.jpg" alt="TrG_studio" width={120} height={120} priority style={{ borderRadius: 16, margin: '0 auto 16px' }} />
        </div>
        <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>One-time setup</span>
        <h1 style={{ color: '#fff' }}>Set up your admin</h1>
        <p className="helper" style={{ marginBottom: 24 }}>Create the private account you will use to manage the studio.</p>
        <div className="field"><label style={{ color: '#fff' }}>Name</label><input name="name" required style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }} /></div>
        <div className="field"><label style={{ color: '#fff' }}>Email</label><input name="email" type="email" required style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }} /></div>
        <div className="field"><label style={{ color: '#fff' }}>Password</label><input name="password" type="password" required minLength={8} style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }} /></div>
        <div className="field"><label style={{ color: '#fff' }}>Setup secret</label><input name="secret" type="password" required style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }} /></div>
        {error && <div className="availability-card" style={{ color: 'var(--danger)', marginTop: 0 }}>{error}</div>}
        <button className="button button-dark" style={{ width: '100%' }} disabled={submitting}>{submitting ? 'Creating...' : 'Create admin account'}</button>
        <Link href="/" className="text-link" style={{ display: 'block', textAlign: 'center', marginTop: 18, color: 'var(--gold-light)' }}>Back to website</Link>
      </form>
    </main>
  );
}

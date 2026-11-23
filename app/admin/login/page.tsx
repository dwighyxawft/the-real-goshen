'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import { getSetupStatus, login, setup } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
import { toast } from 'sonner';

export default function AdminLogin() {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    getSetupStatus().then((data) => {
      if (data.needsSetup) router.replace('/admin/setup');
      else setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    const formData = new FormData(event.currentTarget);
    try {
      await login(formData.get('email') as string, formData.get('password') as string);
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
        <span className="eyebrow" style={{ color: 'var(--gold-light)' }}>Admin workspace</span>
        <h1 style={{ color: '#fff' }}>Welcome back</h1>
        <p className="helper" style={{ marginBottom: 24 }}>Sign in to manage your collection and customer interests.</p>
        <div className="field"><label htmlFor="admin-email" style={{ color: '#fff' }}>Email</label><input id="admin-email" name="email" type="email" required style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }} /></div>
        <div className="field"><label htmlFor="admin-password" style={{ color: '#fff' }}>Password</label><div style={{ position: 'relative' }}><input id="admin-password" name="password" type={show ? 'text' : 'password'} required style={{ paddingRight: 44, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }} /><button type="button" onClick={() => setShow(!show)} aria-label="Toggle password visibility" style={{ position: 'absolute', right: 10, top: 4, width: 40, height: 40, border: 0, background: 'transparent', color: 'var(--muted)' }}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></div>
        {error && <div className="availability-card" style={{ color: 'var(--danger)', marginTop: 0 }}>{error}</div>}
        <button className="button button-dark" style={{ width: '100%' }} disabled={submitting}>{submitting ? 'Signing in...' : 'Sign in'}</button>
        <Link href="/" className="text-link" style={{ display: 'block', textAlign: 'center', marginTop: 18, color: 'var(--gold-light)' }}>Back to website</Link>
      </form>
    </main>
  );
}

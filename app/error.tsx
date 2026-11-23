'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect } from 'react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Image src="/trg-logo-600.jpg" alt="TrG_studio" width={120} height={120} priority style={{ borderRadius: 16, marginBottom: 32 }} />
      <h1 style={{ color: 'var(--gold-light)', fontSize: 40, margin: '0 0 12px', fontFamily: 'Cormorant Garamond, serif' }}>Something went wrong</h1>
      <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 18, marginBottom: 32 }}>An unexpected error occurred. Please try again.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={reset} className="button button-gold">Try again</button>
        <Link href="/" className="button" style={{ color: 'var(--gold-light)' }}>Back to TrG_studio</Link>
      </div>
    </div>
  );
}

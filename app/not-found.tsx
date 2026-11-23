import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <Image src="/trg-logo-600.jpg" alt="TrG_studio" width={120} height={120} priority style={{ borderRadius: 16, marginBottom: 32 }} />
      <h1 style={{ color: 'var(--gold-light)', fontSize: 48, margin: '0 0 12px', fontFamily: 'Cormorant Garamond, serif' }}>Page not found</h1>
      <p style={{ color: 'rgba(255,255,255,.7)', fontSize: 18, marginBottom: 32 }}>The piece you are looking for has moved or no longer exists.</p>
      <Link href="/" className="button button-gold">Back to TrG_studio</Link>
    </div>
  );
}

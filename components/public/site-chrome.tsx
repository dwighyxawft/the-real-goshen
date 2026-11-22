'use client';

import Link from 'next/link';
import { Menu, Search, ShoppingBag, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useCart } from './cart-context';

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const links = [['Shop', '/products'], ['Journal', '/blog'], ['FAQ', '/faq'], ['About', '/about'], ['Contact', '/contact']];
  return (
    <div className="min-h-screen bg-cream text-ink">
      <div className="announcement"><Sparkles size={14} /> New season pieces, selected with intention <span>·</span> preorder-friendly pricing</div>
      <header className="site-header">
        <div className="container header-inner">
          <button className="icon-button mobile-only" aria-label="Open menu" onClick={() => setOpen(true)}><Menu size={21} /></button>
          <Link href="/" className="brand-mark"><span className="brand-monogram">TrG</span><span className="brand-name">TrG_studio</span></Link>
          <nav className="desktop-nav">{links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</nav>
          <div className="header-actions"><button className="icon-button desktop-only" aria-label="Search"><Search size={19} /></button><Link href="/cart" className="cart-link" aria-label={`Cart with ${count} items`}><ShoppingBag size={20} /><span>{count}</span></Link></div>
        </div>
      </header>
      {open && <div className="mobile-menu"><div className="mobile-menu-top"><span className="brand-name">Menu</span><button className="icon-button" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button></div><nav>{links.map(([label, href]) => <Link key={href} href={href} onClick={() => setOpen(false)}>{label}</Link>)}</nav><Link href="/contact" className="button button-gold" onClick={() => setOpen(false)}>Chat with us</Link></div>}
      <main>{children}</main>
      <footer className="site-footer"><div className="container footer-grid"><div><Link href="/" className="footer-brand">TrG_studio</Link><p>Pieces that help you step into your style with confidence.</p><span className="script">Style. Confidence. You.</span></div><div><h4>Shop</h4><Link href="/products?category=Bags">Bags</Link><Link href="/products?category=Shoes">Shoes</Link><Link href="/products?category=Accessories">Accessories</Link></div><div><h4>Help</h4><Link href="/faq">Frequently asked questions</Link><Link href="/contact">Contact us</Link><a href="https://wa.me/2348000000000">WhatsApp</a></div><div><h4>Follow along</h4><p className="muted-dark">New drops and styling notes on Instagram.</p><a href="#instagram">@trg_studio</a></div></div><div className="container footer-bottom"><span>© 2026 TrG_studio</span><span>Built with care</span></div></footer>
      <Link href="https://wa.me/2348000000000" className="whatsapp-float" aria-label="Chat with us on WhatsApp">WA</Link>
    </div>
  );
}

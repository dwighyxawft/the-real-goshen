import Link from 'next/link';
import { BarChart3, CircleHelp, LayoutDashboard, MessageSquare, Package, Settings, ShoppingBag, Sparkles } from 'lucide-react';

const nav = [['Dashboard','/admin',LayoutDashboard],['Products','/admin/products',Package],['Customer interests','/admin/interests',ShoppingBag],['Messages','/admin/contacts',MessageSquare],['Discounts','/admin/discounts',Sparkles],['FAQs','/faq',CircleHelp],['Settings','/admin/settings',Settings]] as const;

export function AdminLayout({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <div className="admin-shell"><aside className="admin-sidebar"><Link href="/admin" className="brand-mark"><span className="brand-monogram">TrG</span><span className="brand-name">TrG_studio</span></Link><nav>{nav.map(([label, href, Icon]) => <Link key={href} href={href} className={href === `/admin/${title.toLowerCase()}` || (title === 'Dashboard' && href === '/admin') ? 'active' : ''}><Icon size={17} /> {label}</Link>)}</nav><div style={{ position:'absolute', bottom:24, left:16, right:16 }}><span className="helper" style={{ color:'var(--muted-dark)' }}>Signed in as</span><p style={{ margin:'5px 0 14px', color:'var(--gold-light)', fontSize:13 }}>Store owner</p><Link href="/" className="helper" style={{ color:'#fff' }}>View website</Link></div></aside><main className="admin-main"><div className="admin-top"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1></div><Link href="/" className="button button-dark">View website</Link></div>{children}</main></div>;
}

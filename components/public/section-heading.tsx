import Link from 'next/link';

export function SectionHeading({ eyebrow, title, link }: { eyebrow: string; title: string; link?: { label: string; href: string } }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{link && <Link href={link.href} className="text-link">{link.label} <span>→</span></Link>}</div>;
}

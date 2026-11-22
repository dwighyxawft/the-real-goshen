'use client';

import { Search, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ProductCard } from '@/components/public/product-card';
import { SiteChrome } from '@/components/public/site-chrome';
import { categories, products } from '@/lib/products';

export default function ProductsPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const filtered = useMemo(() => products.filter((product) => (category === 'All' || product.category === category) && product.name.toLowerCase().includes(query.toLowerCase())), [category, query]);
  return <SiteChrome><section className="page-hero"><div className="container"><span className="breadcrumb">Home / Shop</span><h1>The collection</h1><p>Accessories with presence, selected for real life and the moments that matter.</p></div></section><div className="shop-toolbar"><div className="container toolbar-inner"><div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pieces" aria-label="Search pieces" /></div><div className="filter-chips"><button className={`chip ${category === 'All' ? 'active' : ''}`} onClick={() => setCategory('All')}>All pieces</button>{categories.map((item) => <button key={item} className={`chip ${category === item ? 'active' : ''}`} onClick={() => setCategory(item)}>{item}</button>)}<button className="chip desktop-only"><SlidersHorizontal size={14} /> Filters</button></div></div></div><section className="section"><div className="container"><div className="section-heading"><div><span className="eyebrow">{filtered.length} pieces</span><h2>Made to be noticed</h2></div><span className="helper">Prices are estimates · no payment on the website</span></div>{filtered.length ? <div className="products-grid">{filtered.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h2>No pieces match your search</h2><p>Try another word or clear your filters.</p><button className="button button-dark" onClick={() => { setQuery(''); setCategory('All'); }}>Clear filters</button></div>}</div></section></SiteChrome>;
}

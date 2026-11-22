'use client';

import Link from 'next/link';
import { ArrowLeft, Check, Clock3, MessageCircle, Minus, Plus, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/components/public/cart-context';
import { ProductArt, ProductCard } from '@/components/public/product-card';
import { SiteChrome } from '@/components/public/site-chrome';
import { formatNaira, getProduct, products } from '@/lib/products';

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = getProduct(params.slug);
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  if (!product) return <SiteChrome><div className="empty-state section"><h2>That piece wandered off</h2><Link href="/products" className="button button-dark">Back to the collection</Link></div></SiteChrome>;
  const related = products.filter((item) => item.category === product.category && item.id !== product.id).slice(0,4);
  return <SiteChrome><div className="container"><div className="detail-layout"><div><Link href="/products" className="text-link"><ArrowLeft size={15} style={{ display:'inline', marginRight:4 }} /> Back to shop</Link><ProductArt product={product} className="detail-art" /></div><div className="detail-copy"><span className="eyebrow">{product.category}</span><h1>{product.name}</h1><div className="detail-price"><strong>{formatNaira(product.price)}</strong>{product.originalPrice && <><del>{formatNaira(product.originalPrice)}</del><span className="badge discount">−{product.discount}%</span></>}</div>{product.availability === 'preorder' ? <div className="availability-card"><strong><Clock3 size={16} style={{ display:'inline', marginRight:6 }} /> Preorder · arrives in about {product.leadTime}</strong><span className="helper">We confirm availability, payment, and delivery with you directly.</span></div> : <div className="availability-card"><strong>{product.stock === 'limited' ? 'Limited stock' : 'In stock'}</strong><span className="helper">Ready stock in Lagos. Send your interests and we will confirm details.</span></div>}<p className="detail-description">{product.description}</p><div className="qty-row"><span className="helper">Quantity</span><div className="stepper"><button onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={15} /></button><span>{quantity}</span><button onClick={() => setQuantity((value) => Math.min(10, value + 1))} aria-label="Increase quantity"><Plus size={15} /></button></div></div><div className="detail-actions"><button className="button button-dark" onClick={() => { add(product.id, quantity); setAdded(true); }}>{added ? <><Check size={17} /> Added · View cart</> : 'Add to cart'}</button><a className="button button-light-outline" href={`https://wa.me/2348000000000?text=${encodeURIComponent(`Hello TrG_studio, I am interested in the ${product.name}.`)}`}><MessageCircle size={17} /> Ask about this on WhatsApp</a></div><div className="trust-row"><span><ShieldCheck size={15} /> Direct support</span><span><SparkleIcon /> Low prices</span><span><Clock3 size={15} /> Updates until it arrives</span></div></div></div></div><section className="section section-soft"><div className="container"><div className="section-heading"><div><span className="eyebrow">Keep browsing</span><h2>You may also like</h2></div></div><div className="product-rail">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></div></section></SiteChrome>;
}

function SparkleIcon() { return <span style={{ color: 'var(--gold-text)' }}>✦</span>; }

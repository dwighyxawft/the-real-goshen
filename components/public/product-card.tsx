'use client';

import Link from 'next/link';
import { ArrowUpRight, Clock3, Plus } from 'lucide-react';
import type { Product } from '@/lib/products';
import { formatNaira } from '@/lib/products';
import { useCart } from './cart-context';

export function ProductArt({ product, className = '' }: { product: Product; className?: string }) {
  return <div className={`product-art art-${product.accent} ${className}`}><span>TrG</span><small>{product.category}</small></div>;
}

export function ProductCard({ product }: { product: Product }) {
  const { add, lines } = useCart();
  const quantity = lines.find((line) => line.productId === product.id)?.quantity ?? 0;
  const unavailable = product.availability === 'ready_stock' && product.stock === 'out_of_stock';
  return <article className="product-card"><Link href={`/products/${product.slug}`}><div className="product-image-wrap"><ProductArt product={product} /><div className="card-badges">{product.discount && <span className="badge discount">−{product.discount}%</span>}{product.availability === 'preorder' ? <span className="badge preorder"><Clock3 size={12} /> Preorder</span> : product.stock === 'limited' && <span className="badge limited">Limited stock</span>}</div>{!unavailable && <button className="add-button" onClick={(event) => { event.preventDefault(); add(product.id); }} aria-label={`Add ${product.name} to cart`}>{quantity || <Plus size={18} />}</button>}</div></Link><div className="product-info"><span className="eyebrow">{product.category}</span><Link href={`/products/${product.slug}`} className="product-name">{product.name}</Link><div className="price-row"><strong>{formatNaira(product.price)}</strong>{product.originalPrice && <del>{formatNaira(product.originalPrice)}</del>}<ArrowUpRight size={16} className="desktop-only" /></div></div></article>;
}

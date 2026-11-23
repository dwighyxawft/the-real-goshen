'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Clock3, Plus, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '@/lib/cart/cart-store';
import { formatNaira } from '@/lib/format';

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number;
  availability: 'preorder' | 'ready_stock';
  stockStatus?: 'in_stock' | 'limited' | 'out_of_stock';
  images: string[];
  coverImage: string | null;
  effectiveDiscount: { percentage: number; originalPrice: number; finalPrice: number } | null;
  category: { name: string; slug: string } | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const { add, lines } = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const quantity = lines.find((line) => line.productId === product.id)?.quantity ?? 0;
  const unavailable = product.availability === 'ready_stock' && product.stockStatus === 'out_of_stock';

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (unavailable) return;
    add(product.id);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <article className="product-card">
      <Link href={`/products/${product.slug}`}>
        <div className="product-image-wrap">
          {product.coverImage ? (
            <Image
              src={product.coverImage}
              alt={product.name}
              width={400}
              height={500}
              className="product-image"
              unoptimized
            />
          ) : (
            <div className="product-art-placeholder"><span>TrG</span></div>
          )}
          <div className="card-badges">
            {product.effectiveDiscount && <span className="badge discount">−{product.effectiveDiscount.percentage}%</span>}
            {product.availability === 'preorder' && <span className="badge preorder"><Clock3 size={12} /> Preorder</span>}
            {product.availability === 'ready_stock' && product.stockStatus === 'limited' && <span className="badge limited">Limited stock</span>}
          </div>
          {!unavailable && (
            <button className={`add-button ${justAdded ? 'add-button-added' : ''}`} onClick={handleAdd} aria-label={`Add ${product.name} to cart`}>
              {justAdded ? <Check size={18} /> : quantity > 0 ? <span className="qty-badge">{quantity}</span> : <Plus size={18} />}
            </button>
          )}
        </div>
      </Link>
      <div className="product-info">
        <span className="eyebrow">{product.category?.name ?? 'Accessories'}</span>
        <Link href={`/products/${product.slug}`} className="product-name">{product.name}</Link>
        <div className="price-row">
          <strong>{formatNaira(product.price)}</strong>
          {product.effectiveDiscount && <del>{formatNaira(product.effectiveDiscount.originalPrice)}</del>}
        </div>
      </div>
    </article>
  );
}

'use client';

import { useState } from 'react';
import { Check, MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/lib/cart/cart-store';

export function ProductActionsClient({ productId, name, whatsappUrl }: { productId: string; name: string; whatsappUrl: string }) {
  const { add, hydrated } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    add(productId, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  return (
    <div className="product-actions" style={{ marginTop: 28 }}>
      <div className="stepper" style={{ marginBottom: 16 }}>
        <button onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
          <Minus size={14} />
        </button>
        <span>{qty}</span>
        <button onClick={() => setQty((q) => Math.min(10, q + 1))} aria-label="Increase quantity">
          <Plus size={14} />
        </button>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <button className={`button ${added ? 'button-gold' : 'button-dark'}`} onClick={handleAdd} disabled={!hydrated} style={{ minWidth: 200 }}>
          {added ? <><Check size={17} /> Added to picks</> : <><ShoppingBag size={17} /> Add to my picks</>}
        </button>
        <a href={whatsappUrl} className="button whatsapp-button" style={{ minWidth: 180 }}>
          <MessageCircle size={16} /> Ask a question
        </a>
      </div>
    </div>
  );
}

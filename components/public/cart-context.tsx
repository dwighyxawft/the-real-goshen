'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/products';
import { getProduct, products } from '@/lib/products';

type CartLine = { productId: string; quantity: number };
type CartContextValue = {
  lines: CartLine[];
  items: Product[];
  add: (productId: string, quantity?: number) => void;
  remove: (productId: string) => void;
  update: (productId: string, quantity: number) => void;
  count: number;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  useEffect(() => {
    const saved = window.localStorage.getItem('trg-cart');
    if (saved) setLines(JSON.parse(saved) as CartLine[]);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('trg-cart', JSON.stringify(lines));
  }, [lines]);

  const value = useMemo<CartContextValue>(() => ({
    lines,
    items: lines.map((line) => getProduct(line.productId)).filter((product): product is Product => Boolean(product)),
    add: (productId, quantity = 1) => setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (existing) return current.map((line) => line.productId === productId ? { ...line, quantity: Math.min(10, line.quantity + quantity) } : line);
      return [...current, { productId, quantity }];
    }),
    remove: (productId) => setLines((current) => current.filter((line) => line.productId !== productId)),
    update: (productId, quantity) => setLines((current) => current.map((line) => line.productId === productId ? { ...line, quantity: Math.max(1, Math.min(10, quantity)) } : line)),
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    clear: () => setLines([]),
  }), [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export function getCartProduct(productId: string): Product | undefined {
  return products.find((product) => product.id === productId);
}

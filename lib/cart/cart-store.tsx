'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

type CartLine = { productId: string; quantity: number };
type CartContextValue = {
  lines: CartLine[];
  hydrated: boolean;
  add: (productId: string, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  undoRemove: () => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'trg_cart_v1';
const MAX_LINES = 30;
const MAX_QTY = 10;
const MIN_QTY = 1;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const lastRemoved = useRef<CartLine | null>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) setLines(JSON.parse(saved));
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* ignore */ }
  }, [lines, hydrated]);

  useEffect(() => {
    function onStorage(event: StorageEvent) {
      if (event.key === STORAGE_KEY && event.newValue) {
        try { setLines(JSON.parse(event.newValue)); } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const add = useCallback((productId: string, quantity = 1) => {
    setLines((current) => {
      const existing = current.find((line) => line.productId === productId);
      if (existing) return current.map((line) => line.productId === productId ? { ...line, quantity: Math.min(MAX_QTY, line.quantity + quantity) } : line);
      if (current.length >= MAX_LINES) return current;
      return [...current, { productId, quantity: Math.min(MAX_QTY, Math.max(MIN_QTY, quantity)) }];
    });
  }, []);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((current) => current.map((line) => line.productId === productId ? { ...line, quantity: Math.max(MIN_QTY, Math.min(MAX_QTY, quantity)) } : line));
  }, []);

  const remove = useCallback((productId: string) => {
    setLines((current) => {
      lastRemoved.current = current.find((line) => line.productId === productId) ?? null;
      return current.filter((line) => line.productId !== productId);
    });
  }, []);

  const undoRemove = useCallback(() => {
    if (lastRemoved.current) {
      const item = lastRemoved.current;
      lastRemoved.current = null;
      setLines((current) => {
        if (current.find((line) => line.productId === item.productId)) return current;
        if (current.length >= MAX_LINES) return current;
        return [...current, item];
      });
    }
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((sum, line) => sum + line.quantity, 0), [lines]);

  const value = useMemo<CartContextValue>(() => ({ lines, hydrated, add, setQuantity, remove, undoRemove, clear, count }), [lines, hydrated, add, setQuantity, remove, undoRemove, clear, count]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

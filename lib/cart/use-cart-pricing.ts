'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useCart } from './cart-store';
import { getCartPrice } from '@/lib/api/products';

type CartPricing = {
  items: Array<{
    productId: string;
    slug?: string;
    name?: string;
    coverImage?: string | null;
    quantity: number;
    unitPrice?: number;
    originalPrice?: number;
    discountPercent?: number;
    lineTotal?: number;
    availability?: 'preorder' | 'ready_stock';
    leadTimeText?: string | null;
    available: boolean;
    unavailableReason?: 'removed' | 'out_of_stock';
  }>;
  totals: { subtotal: number; savings: number; estimatedTotal: number };
  hasPreorder: boolean;
  preorderNote: string | null;
  longestLeadTimeText: string | null;
  loading: boolean;
  error: string | null;
};

export function useCartPricing(): CartPricing {
  const { lines, hydrated } = useCart();
  const [data, setData] = useState<CartPricing>({ items: [], totals: { subtotal: 0, savings: 0, estimatedTotal: 0 }, hasPreorder: false, preorderNote: null, longestLeadTimeText: null, loading: false, error: null });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const fetchPrice = useCallback(async (currentLines: { productId: string; quantity: number }[]) => {
    const reqId = ++requestIdRef.current;
    if (!currentLines.length) {
      setData({ items: [], totals: { subtotal: 0, savings: 0, estimatedTotal: 0 }, hasPreorder: false, preorderNote: null, longestLeadTimeText: null, loading: false, error: null });
      return;
    }
    setData((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const result = await getCartPrice(currentLines);
      if (reqId !== requestIdRef.current) return;
      const preorderLines = result.items.filter((item) => item.available && item.availability === 'preorder' && item.leadTimeText);
      const longestLeadTimeText = preorderLines.length ? preorderLines[0].leadTimeText ?? null : null;
      setData({ ...result, longestLeadTimeText, loading: false, error: null });
    } catch (error) {
      if (reqId !== requestIdRef.current) return;
      setData((prev) => ({ ...prev, loading: false, error: error instanceof Error ? error.message : 'Could not load prices' }));
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchPrice(lines), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [lines, hydrated, fetchPrice]);

  return data;
}

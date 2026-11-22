'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useCountdown(endsAt: Date | string | null) {
  const target = endsAt ? new Date(endsAt).getTime() : null;
  const [remaining, setRemaining] = useState(() => target ? Math.max(0, target - Date.now()) : 0);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (target === null) return;
    const interval = setInterval(() => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setRemaining(0);
        clearInterval(interval);
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['discounts'] });
      } else {
        setRemaining(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [target, queryClient]);

  const seconds = Math.floor(remaining / 1000) % 60;
  const minutes = Math.floor(remaining / 60000) % 60;
  const hours = Math.floor(remaining / 3600000) % 24;
  const days = Math.floor(remaining / 86400000);
  const isExpired = remaining === 0 && target !== null;
  return { remaining, seconds, minutes, hours, days, isExpired };
}

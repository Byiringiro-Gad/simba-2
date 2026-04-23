'use client';

import { useEffect, useRef } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { authApi } from '@/lib/api';

export default function AuthBootstrap() {
  const { authToken, setUser, logout } = useSimbaStore();
  const bootstrapped = useRef(false);

  useEffect(() => {
    if (!authToken || bootstrapped.current) return;
    bootstrapped.current = true;

    let cancelled = false;

    const syncAuth = async () => {
      try {
        const res = await authApi.me(authToken);
        if (cancelled) return;

        if (res.ok && res.user) {
          setUser(res.user);
          return;
        }

        logout();
      } catch {
        if (!cancelled) {
          logout();
        }
      }
    };

    syncAuth();

    return () => {
      cancelled = true;
    };
  }, [authToken, logout, setUser]);

  return null;
}


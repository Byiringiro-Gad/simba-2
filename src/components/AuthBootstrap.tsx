'use client';

import { useEffect, useRef } from 'react';
import { useSimbaStore } from '@/store/useSimbaStore';
import { authApi } from '@/lib/api';

/**
 * Validates the persisted auth token against the server once per browser session.
 * Uses sessionStorage so the check survives client-side navigations and bfcache
 * restores without re-running, preventing logout flickers on back navigation.
 * If the token is invalid the user is logged out silently.
 */
export default function AuthBootstrap() {
  const authToken = useSimbaStore(s => s.authToken);
  const setUserRef = useRef(useSimbaStore.getState().setUser);
  const logoutRef  = useRef(useSimbaStore.getState().logout);
  const runningRef = useRef(false);

  // Keep refs pointing at the latest store methods without adding them as deps.
  useEffect(() => {
    setUserRef.current = useSimbaStore.getState().setUser;
    logoutRef.current  = useSimbaStore.getState().logout;
  });

  useEffect(() => {
    if (!authToken) return;

    // Only run once per session per token value.
    const sessionKey = `auth_bootstrap_${authToken.slice(-8)}`;
    if (sessionStorage.getItem(sessionKey) || runningRef.current) return;
    runningRef.current = true;

    let cancelled = false;

    const syncAuth = async () => {
      try {
        const res = await authApi.me(authToken);
        if (cancelled) return;
        if (res.ok && res.user) {
          setUserRef.current(res.user);
          sessionStorage.setItem(sessionKey, '1');
        } else {
          logoutRef.current();
          sessionStorage.removeItem(sessionKey);
        }
      } catch {
        // Network error — keep the user logged in optimistically.
        // The token will be validated on the next successful request.
        if (!cancelled) {
          sessionStorage.setItem(sessionKey, '1');
        }
      } finally {
        runningRef.current = false;
      }
    };

    syncAuth();
    return () => { cancelled = true; };
  }, [authToken]);

  return null;
}

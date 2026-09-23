'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from 'src/store/auth-store';
import { useInterestStore } from 'src/store/interest-store';

export function InterestInitializer() {
  const { authStatus, user } = useAuthStore();
  const { setOwner, sync, pending, ready } = useInterestStore();
  const router = useRouter();
  const client = useQueryClient();
  const owner =
    authStatus === 'checking'
      ? null
      : authStatus === 'authenticated' && user
        ? JSON.stringify([user.authProvider, user.userId])
        : 'guest';

  useEffect(() => {
    client.removeQueries({ queryKey: ['recommendations'] });
    setOwner(owner).catch(() => undefined);
  }, [client, owner, setOwner]);

  useEffect(() => {
    if (!ready || !owner || owner === 'guest' || !pending.length) return undefined;
    const timer = setTimeout(() => {
      sync().catch(() => undefined);
    }, 750);
    return () => clearTimeout(timer);
  }, [owner, pending, ready, sync]);

  useEffect(() => {
    const retry = () => {
      const state = useInterestStore.getState();
      if (state.pending.length || state.syncStatus === 'error') sync().catch(() => undefined);
    };
    const timer = setInterval(retry, 15000);
    window.addEventListener('online', retry);
    return () => {
      clearInterval(timer);
      window.removeEventListener('online', retry);
    };
  }, [sync]);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    try {
      const saved = JSON.parse(sessionStorage.getItem('interest-login-return') ?? 'null');
      sessionStorage.removeItem('interest-login-return');
      if (saved && Date.now() - saved.at < 3600000 && typeof saved.path === 'string') {
        const target = new URL(saved.path, window.location.origin);
        if (target.origin === window.location.origin)
          router.replace(`${target.pathname}${target.search}${target.hash}`);
      }
    } catch {
      /* A blocked session store does not prevent login. */
    }
  }, [authStatus, router]);
  return null;
}

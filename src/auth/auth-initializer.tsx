'use client';

import { useEffect } from 'react';

import { useAuthStore } from 'src/store/auth-store';

import { recoverAuthSession } from './session-recovery';

type Props = {
  children: React.ReactNode;
};

const SESSION_RETRY_BASE_DELAY_MS = 5_000;
const SESSION_RETRY_MAX_DELAY_MS = 60_000;

export function AuthInitializer({ children }: Props) {
  const { login, logout } = useAuthStore();

  useEffect(() => {
    let mounted = true;
    let retryTimeout: ReturnType<typeof setTimeout> | undefined;
    let retryAttempt = 0;

    async function checkUserSession() {
      const session = await recoverAuthSession();
      if (!mounted) return;

      if (session.status === 'authenticated') {
        retryAttempt = 0;
        login(session.user);
      } else if (session.status === 'unauthenticated') {
        retryAttempt = 0;
        logout();
      } else {
        const retryDelay = Math.min(
          SESSION_RETRY_BASE_DELAY_MS * 2 ** retryAttempt,
          SESSION_RETRY_MAX_DELAY_MS
        );
        retryAttempt = Math.min(retryAttempt + 1, 4);
        retryTimeout = setTimeout(checkUserSession, retryDelay);
      }
    }

    checkUserSession();

    return () => {
      mounted = false;
      clearTimeout(retryTimeout);
    };
  }, [login, logout]);

  return <>{children}</>;
}

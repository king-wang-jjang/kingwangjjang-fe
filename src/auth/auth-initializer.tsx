'use client';

import { useEffect } from 'react';

import { getMe } from 'src/api/user-api';
import { refreshAuthSession } from 'src/api/http';
import { useAuthStore } from 'src/store/auth-store';

type Props = {
  children: React.ReactNode;
};

export function AuthInitializer({ children }: Props) {
  const { login, logout } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function checkUserSession() {
      try {
        let user = await getMe();
        if (!user && (await refreshAuthSession())) {
          user = await getMe();
        }
        if (!mounted) return;

        if (user) {
          login(user);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Failed to get user info:', error);
        if (mounted) {
          logout();
        }
      }
    }

    checkUserSession();

    return () => {
      mounted = false;
    };
  }, [login, logout]);

  return <>{children}</>;
}

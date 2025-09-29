'use client';

import { useEffect, useCallback, useState } from 'react';
import { useLazyQuery } from '@apollo/client';

import { userServiceClient } from 'src/apollo';
import { ME_QUERY } from 'src/apollo/user-gql';
import { useAuthStore } from 'src/store/auth-store';

import type { MeResponse } from 'src/types/user';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

type Props = {
  children: React.ReactNode;
};

export function AuthInitializer({ children }: Props) {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const [loading, setLoading] = useState(true);

  const [getMe, { data, error, loading: queryLoading }] = useLazyQuery<MeResponse>(ME_QUERY, {
    client: userServiceClient,
  });

  // Handle query completion and errors using useEffect
  useEffect(() => {
    if (data) {
      console.log('data', data.me);
      if (data?.me) {
        login(data.me);
        setLoading(false);
      } else {
        logout();
        setLoading(false);
      }
    }
  }, [data, login, logout]);

  useEffect(() => {
    if (error) {
      console.error('Failed to get user info:', error);
      logout();
      setLoading(false);
    }
  }, [error, logout]);

  useEffect(() => {
    if (queryLoading) {
      setLoading(true);
    }
  }, [queryLoading]);

  const checkUserSession = useCallback(async () => {
    try {
      await getMe();
    } catch (err: any) {
      console.error('Error checking user session:', err);
      logout();
      setLoading(false);
    }
  }, [getMe, logout]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}

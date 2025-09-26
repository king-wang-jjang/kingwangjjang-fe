'use client';

import { useMemo, useEffect, useCallback } from 'react';
import { useLazyQuery } from '@apollo/client';

import { useSetState } from 'src/hooks/use-set-state';

import { userServiceClient } from 'src/apollo';
import { ME_QUERY } from 'src/apollo/user-gql';

import { AuthContext } from '../auth-context';

import type { AuthState } from '../../types';
import type { MeResponse } from 'src/types';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

type Props = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: Props) {
  const { state, setState } = useSetState<AuthState>({
    user: null,
    loading: true,
  });

  const [getMe] = useLazyQuery<MeResponse>(ME_QUERY, {
    client: userServiceClient,
    onCompleted: (data) => {
      if (data?.me) {
        setState({ user: data.me, loading: false });
      } else {
        setState({ user: null, loading: false });
      }
    },
    onError: (error) => {
      console.error('Failed to get user info:', error);
      setState({ user: null, loading: false });
    },
  });

  const checkUserSession = useCallback(async () => {
    try {
      await getMe();
    } catch (error) {
      console.error('Error checking user session:', error);
      setState({ user: null, loading: false });
    }
  }, [getMe, setState]);

  useEffect(() => {
    checkUserSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user
        ? {
            ...state.user,
            role: state.user?.role ?? 'admin',
          }
        : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

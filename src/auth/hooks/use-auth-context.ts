'use client';

import { useAuthStore } from 'src/auth/store/auth-store';

export function useAuthContext() {
  const { user, isAuthenticated } = useAuthStore();

  return {
    user,
    loading: false,
    authenticated: isAuthenticated,
    unauthenticated: !isAuthenticated,
    checkUserSession: async () => {
      // 세션 체크 로직은 AuthInitializer에서 처리
    },
  };
}



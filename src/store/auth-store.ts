import { create } from 'zustand';

import type { UserType, UserTypeWithoutNull } from '../auth/types'; // User 타입이 정의된 파일에서 import

interface AuthState {
  user: UserType | null;
  isAuthenticated: boolean; // 인증 상태
  authStatus: 'checking' | 'authenticated' | 'unauthenticated';
  login: (user: UserTypeWithoutNull) => void; // 로그인 액션
  updateUser: (user: Partial<UserTypeWithoutNull>) => void;
  logout: () => void; // 로그아웃 액션
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  authStatus: 'checking',
  login: (user) =>
    set({
      user,
      isAuthenticated: true,
      authStatus: 'authenticated',
    }),
  updateUser: (user) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...user } : state.user,
    })),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      authStatus: 'unauthenticated',
    }),
}));

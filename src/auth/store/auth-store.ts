import { create } from 'zustand';

import type { UserType } from '../types';

interface AuthState {
  user: UserType | null;
  isAuthenticated: boolean; // 인증 상태
  login: (user: UserType) => void; // 로그인 액션
  logout: () => void; // 로그아웃 액션
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: (user) =>
    set({
      user,
      isAuthenticated: true,
    }),
  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));

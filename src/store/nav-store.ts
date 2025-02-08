import { create } from 'zustand';

interface NavState {
  isNavMobileOpen: boolean;
  openNavMobile: () => void;
  closeNavMobile: () => void;
  toggleNavMobile: () => void;
}

export const useNavStore = create<NavState>((set) => ({
  isNavMobileOpen: false,
  openNavMobile: () => set({ isNavMobileOpen: true }),
  closeNavMobile: () => set({ isNavMobileOpen: false }),
  toggleNavMobile: () => set((state) => ({ isNavMobileOpen: !state.isNavMobileOpen })),
}));

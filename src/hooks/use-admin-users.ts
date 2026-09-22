import type { AdminUserFilters } from 'src/api/admin-user-api';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from 'src/store/auth-store';
import { getAdminUser, getAdminUsers, updateAdminUser } from 'src/api/admin-user-api';

const ADMIN_USERS_KEY = ['admin', 'users'] as const;

export function useAdminUsers(filters: AdminUserFilters) {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: [...ADMIN_USERS_KEY, user?.Id, 'list', filters],
    queryFn: ({ signal }) => getAdminUsers(filters, signal),
    enabled: user?.role === 'admin',
    gcTime: 0,
    retry: false,
  });
}

export function useAdminUser(memberId: string) {
  const user = useAuthStore((state) => state.user);
  return useQuery({
    queryKey: [...ADMIN_USERS_KEY, user?.Id, 'detail', memberId],
    queryFn: ({ signal }) => getAdminUser(memberId, signal),
    enabled: user?.role === 'admin',
    gcTime: 0,
    retry: false,
  });
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, displayName }: { memberId: string; displayName: string | null }) =>
      updateAdminUser(memberId, displayName),
    onSuccess: (updatedUser) => {
      const auth = useAuthStore.getState();
      if (auth.user?.Id === updatedUser.Id) auth.updateUser(updatedUser);
      return queryClient.invalidateQueries({ queryKey: ADMIN_USERS_KEY });
    },
  });
}

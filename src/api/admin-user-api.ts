import type { UserRole, UserTypeWithoutNull } from 'src/auth/types';

import { apiFetch } from './http';

export type AdminUser = UserTypeWithoutNull;

export type AdminUserFilters = {
  q: string;
  role: UserRole | '';
  page: number;
  pageSize: number;
};

export type AdminUserList = {
  items: AdminUser[];
  total: number;
  page: number;
  pageSize: number;
};

const USERS_PATH = '/userservice/api/admin/users';

export function getAdminUsers(filters: AdminUserFilters, signal?: AbortSignal) {
  const params = new URLSearchParams({
    page: String(filters.page),
    pageSize: String(filters.pageSize),
  });
  if (filters.q) params.set('q', filters.q);
  if (filters.role) params.set('role', filters.role);
  return apiFetch<AdminUserList>(`${USERS_PATH}?${params}`, { signal, cache: 'no-store' });
}

export function getAdminUser(memberId: string, signal?: AbortSignal) {
  return apiFetch<AdminUser>(`${USERS_PATH}/${encodeURIComponent(memberId)}`, {
    signal,
    cache: 'no-store',
  });
}

export function updateAdminUser(memberId: string, displayName: string | null) {
  return apiFetch<AdminUser>(`${USERS_PATH}/${encodeURIComponent(memberId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ displayName }),
  });
}

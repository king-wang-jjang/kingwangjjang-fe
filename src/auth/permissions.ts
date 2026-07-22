import type { UserType } from './types';

export function isAdmin(user: UserType) {
  return user?.role === 'admin';
}

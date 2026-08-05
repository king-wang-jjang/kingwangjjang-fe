import type { MeUserResponse } from 'src/types/user';

import { apiFetch } from './http';

export function getMe(options: { skipAuthRefresh?: boolean } = {}) {
  return apiFetch<MeUserResponse>('/userservice/api/users/me', options);
}

export function updateMeProfile(displayName: string | null) {
  return apiFetch<MeUserResponse>('/userservice/api/users/me', {
    method: 'PATCH',
    body: JSON.stringify({ displayName }),
  });
}

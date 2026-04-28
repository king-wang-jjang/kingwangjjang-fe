import type { MeUserResponse } from 'src/types/user';

import { apiFetch } from './http';

export function getMe() {
  return apiFetch<MeUserResponse>('/userservice/api/users/me');
}

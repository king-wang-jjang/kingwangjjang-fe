import type { AdminUser } from 'src/api/admin-user-api';

import { ApiError } from 'src/api/http';

export function memberName(user: AdminUser) {
  return user.displayName || user.nickname || `회원 ${user.userId}`;
}

export function memberDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '기록 없음';
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function memberError(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401) return '로그인이 만료되었습니다. 다시 로그인해 주세요.';
    if (error.status === 403) return '회원 관리 권한이 없습니다.';
    if (error.status === 404) return '회원을 찾을 수 없습니다. 목록을 새로고침해 주세요.';
    if (error.status === 422) return '입력 내용을 확인해 주세요. 표시 이름은 최대 40자입니다.';
  }
  return '요청을 처리하지 못했습니다. 잠시 후 다시 시도해 주세요.';
}

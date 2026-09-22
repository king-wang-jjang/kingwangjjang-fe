import type { AdminUser, AdminUserFilters } from 'src/api/admin-user-api';

import userEvent from '@testing-library/user-event';
import { render, screen, within, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, test, expect, describe, afterEach, beforeEach } from 'vitest';

import { ApiError } from 'src/api/http';
import { useAuthStore } from 'src/store/auth-store';
import { getAdminUser, getAdminUsers, updateAdminUser } from 'src/api/admin-user-api';

import { UsersView } from 'src/sections/admin/users/view/users-view';

import { AdminGuard } from 'src/auth/guard';

vi.mock('src/api/admin-user-api', () => ({
  getAdminUsers: vi.fn(),
  getAdminUser: vi.fn(),
  updateAdminUser: vi.fn(),
}));

const ADMIN: AdminUser = {
  Id: 'admin',
  userId: '100',
  nickname: '운영자',
  displayName: null,
  authProvider: 'kakao',
  createTime: '2026-01-01T00:00:00Z',
  role: 'admin',
};
const MEMBER: AdminUser = {
  Id: 'member',
  userId: '200',
  nickname: '원래 이름',
  displayName: '테스트 회원',
  authProvider: 'kakao',
  createTime: '2026-02-01T00:00:00Z',
  role: 'user',
};
let client: QueryClient;

function renderView(guarded = false) {
  client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      {guarded ? (
        <AdminGuard>
          <UsersView />
        </AdminGuard>
      ) : (
        <UsersView />
      )}
    </QueryClientProvider>
  );
}

describe('member management', () => {
  beforeEach(() => {
    useAuthStore.getState().login(ADMIN);
    vi.mocked(getAdminUsers)
      .mockReset()
      .mockImplementation(async (filters: AdminUserFilters) => ({
        items: filters.page === 2 ? [ADMIN] : [MEMBER],
        total: 21,
        page: filters.page,
        pageSize: filters.pageSize,
      }));
    vi.mocked(getAdminUser).mockReset().mockResolvedValue(MEMBER);
    vi.mocked(updateAdminUser)
      .mockReset()
      .mockImplementation(async (_, displayName) => ({ ...MEMBER, displayName }));
  });

  afterEach(() => {
    client?.clear();
    useAuthStore.getState().logout();
  });

  test('paginates results and resets the page when searching or filtering', async () => {
    const user = userEvent.setup();
    renderView();
    expect(await screen.findByText('전체 회원 21명')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '다음 페이지' }));
    expect(await screen.findByRole('button', { name: '운영자 상세 보기' })).toBeTruthy();
    expect(getAdminUsers).toHaveBeenLastCalledWith(
      expect.objectContaining({ page: 2 }),
      expect.any(AbortSignal)
    );
    await user.type(screen.getByRole('textbox', { name: '회원 검색' }), '  테스트  ');
    await user.click(screen.getByRole('button', { name: '검색' }));
    await waitFor(() =>
      expect(getAdminUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({ q: '테스트', page: 1 }),
        expect.any(AbortSignal)
      )
    );
    await user.click(screen.getByRole('combobox', { name: '권한' }));
    await user.click(screen.getByRole('option', { name: '관리자' }));
    await waitFor(() =>
      expect(getAdminUsers).toHaveBeenLastCalledWith(
        expect.objectContaining({ q: '테스트', role: 'admin', page: 1 }),
        expect.any(AbortSignal)
      )
    );
    await user.click(screen.getByRole('button', { name: '초기화' }));
    await waitFor(() =>
      expect(getAdminUsers).toHaveBeenLastCalledWith(
        { q: '', role: '', page: 1, pageSize: 20 },
        expect.any(AbortSignal)
      )
    );
  });

  test('loads detail, saves a normalized name and refreshes the list', async () => {
    const user = userEvent.setup();
    renderView();
    await user.click(await screen.findByRole('button', { name: '테스트 회원 상세 보기' }));
    const input = await screen.findByRole('textbox', { name: '표시 이름' });
    expect(getAdminUser).toHaveBeenCalledWith('member', expect.any(AbortSignal));
    expect(within(screen.getByRole('dialog')).getByText('원래 이름')).toBeTruthy();
    expect(screen.getByRole('button', { name: '변경 저장' }).hasAttribute('disabled')).toBe(true);
    await user.clear(input);
    await user.type(input, '  새 이름  ');
    await user.click(screen.getByRole('button', { name: '변경 저장' }));
    expect(await screen.findByText('새 이름 회원의 표시 이름을 저장했습니다.')).toBeTruthy();
    expect(updateAdminUser).toHaveBeenCalledWith('member', '새 이름');
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(getAdminUsers).toHaveBeenCalledTimes(2);
  });

  test('keeps failed edits open and supports retrying with a cleared name', async () => {
    const user = userEvent.setup();
    vi.mocked(updateAdminUser).mockRejectedValueOnce(new ApiError(500, 'failure'));
    renderView();
    await user.click(await screen.findByRole('button', { name: '테스트 회원 상세 보기' }));
    await user.clear(await screen.findByRole('textbox', { name: '표시 이름' }));
    await user.click(screen.getByRole('button', { name: '변경 저장' }));
    expect(await screen.findByText(/요청을 처리하지 못했습니다/)).toBeTruthy();
    expect(screen.getByRole('dialog')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '변경 저장' }));
    expect(await screen.findByText('원래 이름 회원의 표시 이름을 저장했습니다.')).toBeTruthy();
    expect(updateAdminUser).toHaveBeenLastCalledWith('member', null);
  });

  test('prevents overlong edits and cancels without changing the member', async () => {
    const user = userEvent.setup();
    renderView();
    await user.click(await screen.findByRole('button', { name: '테스트 회원 상세 보기' }));
    const input = await screen.findByRole('textbox', { name: '표시 이름' });
    await user.clear(input);
    await user.type(input, '가'.repeat(41));
    expect(screen.getByRole('button', { name: '변경 저장' }).hasAttribute('disabled')).toBe(true);
    await user.click(screen.getByRole('button', { name: '닫기' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(updateAdminUser).not.toHaveBeenCalled();
  });

  test('shows errors with retry and empty results with a reset action', async () => {
    const user = userEvent.setup();
    vi.mocked(getAdminUsers).mockRejectedValueOnce(new ApiError(500, 'failure'));
    renderView();
    expect(await screen.findByText(/요청을 처리하지 못했습니다/)).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '다시 시도' }));
    await screen.findByRole('button', { name: '테스트 회원 상세 보기' });
    vi.mocked(getAdminUsers).mockResolvedValueOnce({ items: [], total: 0, page: 1, pageSize: 20 });
    await user.type(screen.getByRole('textbox', { name: '회원 검색' }), '없는 회원{Enter}');
    expect(await screen.findByText('검색 조건에 맞는 회원이 없습니다.')).toBeTruthy();
    await user.click(screen.getByRole('button', { name: '전체 회원 보기' }));
    expect(await screen.findByRole('button', { name: '테스트 회원 상세 보기' })).toBeTruthy();
  });

  test('updates the signed-in profile after editing your own display name', async () => {
    const user = userEvent.setup();
    vi.mocked(getAdminUser).mockResolvedValue(ADMIN);
    vi.mocked(updateAdminUser).mockResolvedValue({ ...ADMIN, displayName: '새 운영자' });
    renderView();
    await screen.findByText('전체 회원 21명');
    await user.click(screen.getByRole('button', { name: '다음 페이지' }));
    await user.click(await screen.findByRole('button', { name: '운영자 상세 보기' }));
    await user.type(await screen.findByRole('textbox', { name: '표시 이름' }), '새 운영자');
    await user.click(screen.getByRole('button', { name: '변경 저장' }));
    await screen.findByText('새 운영자 회원의 표시 이름을 저장했습니다.');
    expect(useAuthStore.getState().user?.displayName).toBe('새 운영자');
  });

  test('does not request member data for regular users', () => {
    useAuthStore.getState().login(MEMBER);
    renderView(true);
    expect(screen.getByText('접근 권한이 없습니다')).toBeTruthy();
    expect(getAdminUsers).not.toHaveBeenCalled();
  });
});

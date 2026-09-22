import { StrictMode } from 'react';
import userEvent from '@testing-library/user-event';
import { act, render, screen, cleanup } from '@testing-library/react';
import { vi, test, expect, describe, afterEach, beforeEach } from 'vitest';

import { updateMeProfile } from 'src/api/user-api';
import { useReadStore } from 'src/store/read-store';
import { useAuthStore } from 'src/store/auth-store';
import AccountHistoryPage from 'src/app/account/history/page';
import AccountSettingsPage from 'src/app/account/settings/page';

vi.mock('src/api/user-api', () => ({ updateMeProfile: vi.fn() }));
vi.mock('src/hooks/use-board', () => ({ useBoard: () => ({ postData: [] }) }));

const USER = {
  Id: 'account-member',
  userId: '123',
  nickname: '카카오 닉네임',
  displayName: '현재 이름',
  authProvider: 'kakao',
  createTime: '2026-09-22T00:00:00Z',
  role: 'user' as const,
};

describe('account pages with the real reading-history store', () => {
  beforeEach(() => {
    useAuthStore.getState().login(USER);
    useReadStore.setState({ readPosts: {} });
    vi.mocked(updateMeProfile)
      .mockReset()
      .mockImplementation(async (displayName) => ({ ...USER, displayName }));
  });

  afterEach(() => {
    cleanup();
    useAuthStore.getState().logout();
    useReadStore.setState({ readPosts: {} });
  });

  test('opens settings with empty history and reacts to new reads without a render loop', () => {
    render(
      <StrictMode>
        <AccountSettingsPage />
      </StrictMode>
    );
    expect(screen.getByRole('heading', { name: '계정 설정' })).toBeTruthy();
    expect(screen.getByText('지금까지 0개의 글을 읽었습니다.')).toBeTruthy();
    act(() => useReadStore.getState().markAsRead('new-post'));
    expect(screen.getByText('지금까지 1개의 글을 읽었습니다.')).toBeTruthy();
    expect(screen.queryByText('마지막으로 읽은 시간: 기록 없음')).toBeNull();
  });

  test('saves the display name and updates the signed-in profile', async () => {
    const user = userEvent.setup();
    render(<AccountSettingsPage />);
    const name = screen.getByRole('textbox', { name: '표시 이름' });
    await user.clear(name);
    await user.type(name, ' 새 이름 ');
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByText('표시 이름을 저장했습니다.')).toBeTruthy();
    expect(updateMeProfile).toHaveBeenCalledWith('새 이름');
    expect(useAuthStore.getState().user?.displayName).toBe('새 이름');
    expect((name as HTMLInputElement).value).toBe('새 이름');
  });

  test('clears the custom name so the original nickname is shown', async () => {
    const user = userEvent.setup();
    render(<AccountSettingsPage />);
    await user.clear(screen.getByRole('textbox', { name: '표시 이름' }));
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByText('표시 이름을 비웠습니다.')).toBeTruthy();
    expect(updateMeProfile).toHaveBeenCalledWith(null);
    expect(useAuthStore.getState().user?.displayName).toBeNull();
  });

  test('shows save failure and lets the user retry without losing their input', async () => {
    const user = userEvent.setup();
    vi.mocked(updateMeProfile).mockRejectedValueOnce(new Error('저장 실패'));
    render(<AccountSettingsPage />);
    const name = screen.getByRole('textbox', { name: '표시 이름' });
    await user.clear(name);
    await user.type(name, '다시 저장');
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByRole('alert')).toBeTruthy();
    expect(useAuthStore.getState().user?.displayName).toBe('현재 이름');
    expect((name as HTMLInputElement).value).toBe('다시 저장');
    await user.click(screen.getByRole('button', { name: '저장' }));
    expect(await screen.findByText('표시 이름을 저장했습니다.')).toBeTruthy();
  });

  test('opens history, sorts persisted and legacy entries and clears the history', async () => {
    const user = userEvent.setup();
    useReadStore.setState({
      readPosts: {
        older: '2026-09-20T00:00:00Z',
        newest: '2026-09-22T00:00:00Z',
        legacy: true,
        unread: false,
      },
    });
    render(
      <StrictMode>
        <AccountHistoryPage />
      </StrictMode>
    );
    expect(screen.getByRole('heading', { name: '계정 기록' })).toBeTruthy();
    expect(screen.getAllByText(/^(newest|older|legacy)$/).map((item) => item.textContent)).toEqual([
      'newest',
      'older',
      'legacy',
    ]);
    expect(screen.getByText('예전 기록')).toBeTruthy();
    expect(screen.queryByText('unread')).toBeNull();
    await user.click(screen.getByRole('button', { name: '기록 비우기' }));
    expect(screen.getByText('아직 이 브라우저에 저장된 읽은 글이 없습니다.')).toBeTruthy();
    expect(useReadStore.getState().readPosts).toEqual({});
  });
});

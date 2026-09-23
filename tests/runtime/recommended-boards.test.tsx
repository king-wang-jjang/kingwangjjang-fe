import type { PropsWithChildren } from 'react';

import { act, waitFor, renderHook } from '@testing-library/react';
import { vi, test, expect, beforeEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useRecommendedBoards } from 'src/hooks/use-recommended-boards';
import { useAuthStore } from 'src/store/auth-store';
import { useInterestStore, GUEST_INTEREST_KEY } from 'src/store/interest-store';
import { emptyProfile } from 'src/personalization/interests';
import { getRecommendations, getRecommendationPosts } from 'src/api/recommendation-api';

vi.mock('src/api/recommendation-api', () => ({
  getRecommendations: vi.fn(),
  getRecommendationPosts: vi.fn(),
  getInterestProfile: vi.fn(),
  updateInterestProfile: vi.fn(),
}));

beforeEach(async () => {
  await useInterestStore.getState().setOwner(null);
  localStorage.setItem(
    GUEST_INTEREST_KEY,
    JSON.stringify({ id: 'guest', profile: emptyProfile() })
  );
  useAuthStore.getState().logout();
  await useInterestStore.getState().setOwner('guest');
  vi.mocked(getRecommendations)
    .mockReset()
    .mockResolvedValue({
      items: Array.from({ length: 35 }, (_, index) => ({
        id: `post-${index}`,
        reason: '게임 추천',
      })),
    });
  vi.mocked(getRecommendationPosts)
    .mockReset()
    .mockImplementation(async (items) =>
      items.map((item) => ({
        Id: item.id,
        recommendationReason: item.reason,
        category: 'free',
        no: 1,
        site: 'dcinside',
        siteLabel: '디시인사이드',
        title: item.id,
        url: 'https://example.com',
        createTime: new Date().toISOString(),
        tags: ['게임'],
      }))
    );
});

function setup(filters = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook((props) => useRecommendedBoards(props.filters, props.enabled), {
    wrapper,
    initialProps: { filters, enabled: true },
  });
}

test('freezes order while recording new activity and paginates the same snapshot', async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.posts).toHaveLength(30));
  act(() => useInterestStore.getState().record('open', ['스포츠'], 'new-interest'));
  expect(getRecommendations).toHaveBeenCalledTimes(1);
  await act(async () => {
    await result.current.fetchNextPage();
  });
  await waitFor(() => expect(result.current.posts).toHaveLength(35));
  expect(result.current.posts.map((post) => post.Id)).toEqual(
    Array.from({ length: 35 }, (_, index) => `post-${index}`)
  );
  act(() => result.current.refresh());
  await waitFor(() => expect(getRecommendations).toHaveBeenCalledTimes(2));
});

test('passes explicit filters and only sends guest interests for anonymous requests', async () => {
  const filters = { tag: '게임', sites: ['dcinside'] };
  const { result } = setup(filters);
  await waitFor(() => expect(result.current.posts).toHaveLength(30));
  expect(getRecommendations).toHaveBeenCalledWith(filters, emptyProfile());
});

test('hides the previous recommendation list immediately during an account transition', async () => {
  const { result } = setup();
  await waitFor(() => expect(result.current.posts).toHaveLength(30));
  act(() =>
    useAuthStore.getState().login({
      Id: 'alice',
      userId: 'alice',
      authProvider: 'kakao',
      role: 'user',
      createTime: new Date().toISOString(),
    })
  );
  expect(result.current.posts).toHaveLength(0);
  expect(getRecommendations).toHaveBeenCalledTimes(1);
});

test('does not request personalized data in the all-posts view', async () => {
  const { rerender } = setup();
  rerender({ filters: {}, enabled: false });
  const calls = vi.mocked(getRecommendations).mock.calls.length;
  act(() => useInterestStore.getState().record('open', ['게임'], 'game'));
  expect(getRecommendations).toHaveBeenCalledTimes(calls);
});

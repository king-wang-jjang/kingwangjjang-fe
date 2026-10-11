import type { ReactNode } from 'react';
import type { BoardPost, HourlyPostRankings } from 'src/api/board-api';

import { act, renderHook } from '@testing-library/react';
import { vi, test, expect, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useTopBoards } from 'src/hooks/use-top-boards';
import { useHourlyPostRankings } from 'src/hooks/use-hourly-post-rankings';
import { getDailyBoards, getDailyBoardHistory, getHourlyPostRankings } from 'src/api/board-api';

vi.mock('src/api/board-api', () => ({
  getDailyBoards: vi.fn(),
  getDailyBoardHistory: vi.fn(),
  getDailyBoardHistoryDates: vi.fn(),
  getHourlyPostRankings: vi.fn(),
}));
afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

const initialPost = { Id: 'old', title: '이전 인기글', analysisStatus: 'done' } as BoardPost;
const initialTimeline = {
  generatedAt: '2026-10-11T02:00:00Z',
  windowHours: 24,
  rankings: [],
} as HourlyPostRankings;

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

test('updates both the current popular feed and chart each minute after analysis finishes', async () => {
  vi.useFakeTimers();
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(['boards', 'daily', 'top10', 'today'], [initialPost]);
  client.setQueryData(['boards', 'daily', 'hourly-rankings'], initialTimeline);
  vi.mocked(getDailyBoards).mockResolvedValue([{ ...initialPost, Id: 'new', title: '새 인기글' }]);
  vi.mocked(getHourlyPostRankings).mockResolvedValue({
    ...initialTimeline,
    generatedAt: '2026-10-11T02:01:00Z',
  });
  const { result, unmount } = renderHook(
    () => ({ feed: useTopBoards(), chart: useHourlyPostRankings() }),
    { wrapper: wrapper(client) }
  );
  expect(getDailyBoards).not.toHaveBeenCalled();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(60_010);
  });
  expect(getDailyBoards).toHaveBeenCalledTimes(1);
  expect(getHourlyPostRankings).toHaveBeenCalledTimes(1);
  expect(result.current.feed.data?.[0].title).toBe('새 인기글');
  expect(result.current.chart.data?.generatedAt).toBe('2026-10-11T02:01:00Z');
  unmount();
  client.clear();
});

test('keeps historical Top 10 records fixed without polling the live ranking', async () => {
  vi.useFakeTimers();
  const client = new QueryClient();
  client.setQueryData(['boards', 'daily', 'top10', '2026-10-10'], [initialPost]);
  const { result, unmount } = renderHook(() => useTopBoards('2026-10-10'), {
    wrapper: wrapper(client),
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(180_000);
  });
  expect(getDailyBoards).not.toHaveBeenCalled();
  expect(getDailyBoardHistory).not.toHaveBeenCalled();
  expect(result.current.data?.[0].title).toBe('이전 인기글');
  unmount();
  client.clear();
});

import type { ReactNode } from 'react';

import { act, renderHook } from '@testing-library/react';
import { vi, test, expect, afterEach } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { getDailyIssueBriefing } from 'src/api/board-api';
import { useDailyIssueBriefing } from 'src/hooks/use-daily-issue-briefing';

vi.mock('src/api/board-api', () => ({ getDailyIssueBriefing: vi.fn() }));

afterEach(() => vi.useRealTimers());

test('starts a new query at Korean midnight instead of showing yesterday’s cached briefing', async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-10-11T14:59:59Z'));
  const yesterday = { date: '2026-10-11', issues: [{ title: '어제의 이슈' }] };
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  queryClient.setQueryData(['boards', 'issues', 'briefing', '2026-10-11'], yesterday);
  vi.mocked(getDailyIssueBriefing).mockReturnValue(new Promise(() => {}));
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  const { result, unmount } = renderHook(useDailyIssueBriefing, { wrapper: Wrapper });
  expect(result.current.data).toBe(yesterday);
  expect(getDailyIssueBriefing).not.toHaveBeenCalled();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(1001);
  });
  expect(getDailyIssueBriefing).toHaveBeenCalledTimes(1);
  expect(getDailyIssueBriefing).toHaveBeenCalledWith({ limit: 10 });
  expect(result.current.isPending).toBe(true);
  expect(result.current.data).toBeUndefined();
  unmount();
  queryClient.clear();
});

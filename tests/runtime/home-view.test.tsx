import userEvent from '@testing-library/user-event';
import { act, render, within, fireEvent } from '@testing-library/react';
import { vi, test, expect, describe, afterEach } from 'vitest';

import { HomeView } from 'src/sections/home/view/home-view';
import { IssueCloseup } from 'src/sections/home/activity/issue-closeup';

const { useBriefing } = vi.hoisted(() => ({ useBriefing: vi.fn() }));

vi.mock('src/hooks/use-daily-issue-briefing', () => ({
  useDailyIssueBriefing: useBriefing,
}));

vi.mock('src/hooks/use-hourly-post-rankings', () => ({
  useHourlyPostRankings: () => ({
    data: {
      rankings: [
        {
          startedAt: '2026-10-11T02:00:00Z',
          capturedAt: '2026-10-11T02:05:00Z',
          isLive: true,
          posts: [
            {
              boardId: 'ranking-post',
              rank: 1,
              title: '순위 그래프 인기글',
              site: 'dcinside',
              siteLabel: '디시인사이드',
              url: 'https://example.com/ranking',
            },
          ],
        },
      ],
    },
    isPending: false,
    isError: false,
    isFetching: false,
  }),
}));

function briefingQuery() {
  return {
    data: {
      generatedAt: '2026-10-11T02:00:00Z',
      date: '2026-10-11',
      startedAt: '2026-10-10T15:00:00Z',
      timeZone: 'Asia/Seoul',
      totalPosts: 8,
      totalIssues: 1,
      sourceCount: 2,
      issues: [
        {
          id: 'strike',
          rank: 1,
          title: '서울 지하철 파업 예고',
          summary: '노조가 파업을 예고해 출근길 운행 차질이 예상됩니다.',
          postCount: 8,
          sourceCount: 2,
          sources: [{ site: 'theqoo', siteLabel: '더쿠', postCount: 5 }],
          posts: [
            {
              boardId: 'strike',
              site: 'theqoo',
              siteLabel: '더쿠',
              title: '파업 예고 원문',
              url: 'https://example.com/strike',
            },
          ],
        },
      ],
    },
    isPending: false,
    isError: false,
    isFetching: false,
  };
}

useBriefing.mockImplementation(briefingQuery);

function tenIssueQuery() {
  const query = briefingQuery();
  const example = query.data.issues[0];
  return {
    ...query,
    data: {
      ...query.data,
      totalIssues: 10,
      issues: Array.from({ length: 10 }, (_, index) => ({
        ...example,
        id: `issue-${index}`,
        rank: index + 1,
        title: `오늘의 사회 이슈 ${index + 1}`,
        summary: `${index + 1}번째 이슈의 실제 요약입니다.`,
        posts: [{ ...example.posts[0], url: `https://example.com/issue/${index + 1}` }],
      })),
    },
  };
}

vi.mock('src/hooks/use-top-boards', () => ({
  useTopBoards: () => ({
    data: [
      {
        Id: 'board-1',
        category: 'humor',
        no: 1,
        site: 'dcinside',
        siteLabel: '디시인사이드',
        title: '첫 번째 인기 이야기',
        url: 'https://example.com/1',
        gptAnswer: '첫 번째 이야기의 요약입니다.',
        tags: ['유머'],
        createTime: '2026-08-31T11:00:00Z',
        commentCount: 12,
        likeCount: 34,
      },
      {
        Id: 'board-2',
        category: 'issue',
        no: 2,
        site: 'theqoo',
        siteLabel: '더쿠',
        title: '두 번째 인기 이야기',
        url: 'https://example.com/2',
        gptAnswer: '두 번째 이야기의 요약입니다.',
        tags: ['이슈'],
        createTime: '2026-08-31T10:00:00Z',
        commentCount: 56,
        likeCount: 78,
      },
    ],
    isPending: false,
    isError: false,
  }),
}));

describe('HomeView', () => {
  afterEach(() => {
    useBriefing.mockImplementation(briefingQuery);
    vi.useRealTimers();
  });

  test('shows today’s leading social issue summary, counts and original sources', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText, queryByText } = render(<HomeView />);

    expect(getByText(/^CLOSEUP/)).toBeTruthy();
    expect(getByRole('heading', { name: '서울 지하철 파업 예고' })).toBeTruthy();
    expect(getByText('노조가 파업을 예고해 출근길 운행 차질이 예상됩니다.')).toBeTruthy();
    expect(getByText('게시글 8개')).toBeTruthy();
    expect(getByText('커뮤니티 2곳')).toBeTruthy();
    expect(queryByText('시간별 태그 순위')).toBeNull();
    expect(queryByText('[01] 태그 순위')).toBeNull();
    expect(getByRole('heading', { name: '[02] 인기글 순위 변화' })).toBeTruthy();
    expect(getByRole('heading', { name: '[03] 오늘의 인기글' })).toBeTruthy();
    await user.click(getByText('[관련 원문 보기 ↗]'));
    expect(getByRole('link', { name: '[더쿠] 파업 예고 원문' }).getAttribute('href')).toBe(
      'https://example.com/strike'
    );
  });

  test('shows an empty day without promoting unrelated popular posts into issues', () => {
    const query = briefingQuery();
    useBriefing.mockReturnValue({
      ...query,
      data: { ...query.data, issues: [], totalPosts: 0, totalIssues: 0, sourceCount: 0 },
    });
    const { getByText, queryByText } = render(<HomeView />);
    expect(getByText(/아직 오늘의 사회 이슈를 요약할 게시글이 없습니다/)).toBeTruthy();
    expect(queryByText('오늘 가장 많이 언급')).toBeNull();
  });

  test('keeps the last briefing visible when a refresh fails', () => {
    useBriefing.mockReturnValue({ ...briefingQuery(), isError: true });
    const { getByRole } = render(<HomeView />);
    expect(getByRole('alert').textContent).toContain(
      '집계 갱신에 실패해 마지막 데이터를 표시합니다.'
    );
    expect(getByRole('heading', { name: '서울 지하철 파업 예고' })).toBeTruthy();
  });

  test('keeps ten titles in the board and closeups the selected issue with its own source', async () => {
    const user = userEvent.setup();
    useBriefing.mockReturnValue(tenIssueQuery());
    const { getByRole, getByText, queryByRole } = render(<HomeView />);
    const board = getByRole('list', { name: '[01] 오늘의 이슈' });
    expect(within(board).getAllByRole('button')).toHaveLength(10);
    expect(getByRole('heading', { level: 1 }).textContent).toBe('오늘의 사회 이슈 1');

    await user.click(getByRole('button', { name: '10위 이슈 클로즈업: 오늘의 사회 이슈 10' }));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('오늘의 사회 이슈 10');
    expect(getByText('10번째 이슈의 실제 요약입니다.')).toBeTruthy();
    expect(queryByRole('heading', { name: '오늘의 사회 이슈 1' })).toBeNull();
    expect(getByRole('button', { name: '이슈 자동 넘김' }).getAttribute('aria-pressed')).toBe(
      'false'
    );
    await user.click(getByText('[관련 원문 보기 ↗]'));
    expect(getByRole('link', { name: '[더쿠] 파업 예고 원문' }).getAttribute('href')).toBe(
      'https://example.com/issue/10'
    );

    await user.click(getByRole('button', { name: '다음 이슈' }));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('오늘의 사회 이슈 1');
    await user.click(getByRole('button', { name: '이전 이슈' }));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('오늘의 사회 이슈 10');
    expect(within(board).getAllByRole('button')).toHaveLength(10);
  });

  test('preserves the selected issue by identity when a refresh reorders the board', async () => {
    const user = userEvent.setup();
    const query = tenIssueQuery();
    useBriefing.mockReturnValue(query);
    const { getByRole, rerender } = render(<HomeView />);
    await user.click(getByRole('button', { name: '2위 이슈 클로즈업: 오늘의 사회 이슈 2' }));
    useBriefing.mockReturnValue({
      ...query,
      data: { ...query.data, issues: [...query.data.issues].reverse() },
    });
    rerender(<HomeView />);
    expect(getByRole('heading', { level: 1 }).textContent).toBe('오늘의 사회 이슈 2');
    expect(
      getByRole('button', { name: '9위 이슈 클로즈업: 오늘의 사회 이슈 2' }).getAttribute(
        'aria-pressed'
      )
    ).toBe('true');
  });

  test('automatically advances, pauses while reading, and respects reduced motion', async () => {
    vi.useFakeTimers();
    const issues = tenIssueQuery().data.issues.slice(0, 2);
    const { getByRole, container, rerender } = render(
      <IssueCloseup issues={issues} motionEnabled isMotionReduced={false} />
    );
    await act(async () => vi.advanceTimersByTimeAsync(12_000));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('오늘의 사회 이슈 2');
    fireEvent.pointerEnter(container.firstChild!);
    await act(async () => vi.advanceTimersByTimeAsync(24_000));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('오늘의 사회 이슈 2');
    fireEvent.pointerLeave(container.firstChild!);
    await act(async () => vi.advanceTimersByTimeAsync(12_000));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('오늘의 사회 이슈 1');
    fireEvent.click(getByRole('button', { name: '다음 이슈' }));
    await act(async () => vi.advanceTimersByTimeAsync(24_000));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('오늘의 사회 이슈 2');
    fireEvent.focus(getByRole('button', { name: '이슈 자동 넘김' }));
    fireEvent.click(getByRole('button', { name: '이슈 자동 넘김' }));
    await act(async () => vi.advanceTimersByTimeAsync(12_000));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('오늘의 사회 이슈 1');
    rerender(<IssueCloseup issues={issues} motionEnabled isMotionReduced />);
    await act(async () => vi.advanceTimersByTimeAsync(24_000));
    expect(getByRole('heading', { level: 1 }).textContent).toBe('오늘의 사회 이슈 1');
    expect((getByRole('button', { name: '이슈 자동 넘김' }) as HTMLButtonElement).disabled).toBe(
      true
    );
  });

  test('lets visitors preview another Top 10 story before opening it', async () => {
    const user = userEvent.setup();

    const { getByRole, queryByRole } = render(<HomeView />);

    expect(queryByRole('heading', { name: '첫 번째 인기 이야기' })).toBeNull();

    await user.click(getByRole('button', { name: /2위.*두 번째 인기 이야기/ }));

    expect(getByRole('heading', { name: '두 번째 인기 이야기' })).toBeTruthy();
    expect(getByRole('link', { name: '2위 글 자세히 보기' }).getAttribute('href')).toBe(
      '/top10?rank=2'
    );
  });
});

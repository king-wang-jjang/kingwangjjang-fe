import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { vi, test, expect, describe, afterEach } from 'vitest';

import { HomeView } from 'src/sections/home/view/home-view';

const { useBriefing } = vi.hoisted(() => ({ useBriefing: vi.fn() }));

vi.mock('src/hooks/use-daily-issue-briefing', () => ({
  useDailyIssueBriefing: useBriefing,
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
  });

  test('shows today’s leading social issue summary, counts and original sources', async () => {
    const user = userEvent.setup();
    const { getByRole, getByText, queryByText } = render(<HomeView />);

    expect(getByRole('heading', { name: '# 오늘의 사회 이슈' })).toBeTruthy();
    expect(getByRole('heading', { name: '서울 지하철 파업 예고' })).toBeTruthy();
    expect(getByText('노조가 파업을 예고해 출근길 운행 차질이 예상됩니다.')).toBeTruthy();
    expect(getByText('게시글 8개')).toBeTruthy();
    expect(getByText('커뮤니티 2곳')).toBeTruthy();
    expect(queryByText('시간별 태그 순위')).toBeNull();
    expect(queryByText('[01] 태그 순위')).toBeNull();
    await user.click(getByText('[관련 원문 보기]'));
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

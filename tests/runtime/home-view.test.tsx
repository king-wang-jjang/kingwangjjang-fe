import userEvent from '@testing-library/user-event';
import { render, fireEvent } from '@testing-library/react';
import { vi, test, expect, describe, afterEach } from 'vitest';

import { HomeView } from 'src/sections/home/view/home-view';

const { push } = vi.hoisted(() => ({ push: vi.fn() }));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}));

vi.mock('src/hooks/use-issue-overview', () => ({
  useIssueOverview: () => ({
    data: {
      generatedAt: '2026-08-31T12:00:00Z',
      windowHours: 24,
      totalPosts: 8,
      totalTags: 1,
      tags: [
        {
          tag: '유머',
          postCount: 8,
          currentPosts: 6,
          previousPosts: 2,
          impactScore: 42.5,
          share: 1,
          momentumPercent: 133.3,
          topSites: [{ site: 'dcinside', siteLabel: '디시인사이드', postCount: 8 }],
          relatedTags: ['이슈', '일상'],
        },
      ],
    },
    isPending: false,
    isError: false,
  }),
}));

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
    push.mockReset();
  });

  test('opens the board with the selected AI tag', () => {
    const { container } = render(<HomeView />);
    const topicNode = container.querySelector('[data-topic-node="topic:%EC%9C%A0%EB%A8%B8"]');

    expect(topicNode).toBeTruthy();
    fireEvent.click(topicNode!);

    expect(push).toHaveBeenCalledWith('/board?tag=%EC%9C%A0%EB%A8%B8');
  });

  test('lets visitors preview another Top 10 story before opening it', async () => {
    const user = userEvent.setup();

    const { getByRole } = render(<HomeView />);

    expect(getByRole('heading', { name: '첫 번째 인기 이야기' })).toBeTruthy();

    await user.click(getByRole('button', { name: /2위.*두 번째 인기 이야기/ }));

    expect(getByRole('heading', { name: '두 번째 인기 이야기' })).toBeTruthy();
    expect(getByRole('link', { name: '2위 글 자세히 보기' }).getAttribute('href')).toBe(
      '/top10?rank=2'
    );
  });
});

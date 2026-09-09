import type { BoardPost } from 'src/api/board-api';

import { test, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, within } from '@testing-library/react';

import { TrendingPostFeed } from 'src/sections/home/activity/trending-post-feed';

const POSTS: BoardPost[] = [
  {
    Id: 'post-a',
    category: 'issue',
    no: 11,
    site: 'community-a',
    siteLabel: '커뮤니티 A',
    title: 'API 첫 번째 글',
    url: 'data:text/html,unsafe',
    gptAnswer: '실제 AI 요약 A',
    tags: ['AI', '기술'],
    createTime: '2026-09-04T01:00:00Z',
    nativeViewCount: null,
    nativeLikeCount: null,
    nativeCommentCount: null,
    dailyScore: null,
    hotScore: null,
  },
  {
    Id: 'post-b',
    category: 'issue',
    no: 12,
    site: 'community-b',
    siteLabel: '커뮤니티 B',
    title: '가장 최신 글',
    url: 'https://example.com/b',
    gptAnswer: '실제 AI 요약 B',
    tags: ['모바일'],
    createTime: '2026-09-04T03:00:00Z',
    nativeViewCount: 0,
    nativeLikeCount: null,
    nativeCommentCount: null,
    dailyScore: 80,
    hotScore: 120,
  },
  {
    Id: 'post-c',
    category: 'issue',
    no: 13,
    site: 'community-c',
    siteLabel: '커뮤니티 C',
    title: '반응 점수가 가장 높은 글',
    url: 'https://example.com/c',
    tags: ['AI'],
    createTime: '2026-09-04T02:00:00Z',
    hotScore: 100,
  },
];

function renderFeed(posts: readonly BoardPost[] = POSTS) {
  return render(
    <TrendingPostFeed posts={posts} isLoading={false} isError={false} featuredTag="AI" />
  );
}

describe('TrendingPostFeed', () => {
  test('opens only the selected row preview and toggles it closed while retaining its API rank', async () => {
    const user = userEvent.setup();
    const screen = renderFeed();

    expect(screen.queryByRole('article')).toBeNull();
    const firstPost = screen.getByRole('button', { name: /1위.*API 첫 번째 글 미리보기/ });
    const secondPost = screen.getByRole('button', { name: /2위.*가장 최신 글 미리보기/ });
    expect(firstPost.getAttribute('aria-expanded')).toBe('false');
    expect(secondPost.getAttribute('aria-expanded')).toBe('false');

    await user.click(firstPost);
    expect(screen.getByRole('heading', { name: 'API 첫 번째 글' })).toBeTruthy();
    expect(firstPost.getAttribute('aria-expanded')).toBe('true');

    await user.click(secondPost);

    expect(screen.queryByRole('heading', { name: 'API 첫 번째 글' })).toBeNull();
    expect(screen.getByRole('heading', { name: '가장 최신 글' })).toBeTruthy();
    expect(firstPost.getAttribute('aria-expanded')).toBe('false');
    expect(secondPost.getAttribute('aria-expanded')).toBe('true');
    expect(secondPost.closest('li')?.querySelector('article')).toBe(screen.getByRole('article'));
    expect(screen.getByRole('article').parentElement?.id).toBe(
      secondPost.getAttribute('aria-controls')
    );
    expect(screen.getByRole('link', { name: '2위 글 자세히 보기' }).getAttribute('href')).toBe(
      '/top10?rank=2'
    );

    await user.click(secondPost);
    expect(screen.queryByRole('article')).toBeNull();
    expect(secondPost.getAttribute('aria-expanded')).toBe('false');
  });

  test('sorts reaction and latest modes only with real BoardPost values', async () => {
    const user = userEvent.setup();
    const screen = renderFeed();

    await user.click(screen.getByRole('button', { name: '반응' }));

    const reactionPosts = within(screen.getByRole('list')).getAllByRole('button');
    expect(reactionPosts[0].getAttribute('aria-label')).toContain('반응 점수가 가장 높은 글');
    expect(screen.queryByRole('article')).toBeNull();
    await user.click(reactionPosts[0]);

    expect(screen.getByRole('heading', { name: '반응 점수가 가장 높은 글' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '3위 글 자세히 보기' }).getAttribute('href')).toBe(
      '/top10?rank=3'
    );

    await user.click(screen.getByRole('button', { name: '최신' }));

    const latestPosts = within(screen.getByRole('list')).getAllByRole('button');
    expect(latestPosts[0].getAttribute('aria-label')).toContain('가장 최신 글');
    expect(screen.queryByRole('article')).toBeNull();
    await user.click(latestPosts[0]);

    expect(screen.getByRole('heading', { name: '가장 최신 글' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '2위 글 자세히 보기' }).getAttribute('href')).toBe(
      '/top10?rank=2'
    );
  });

  test('keeps every post directly navigable at its original rank after sorting', async () => {
    const user = userEvent.setup();
    const screen = renderFeed();

    await user.click(screen.getByRole('button', { name: '반응' }));

    POSTS.forEach((post, index) => {
      const detailLink = screen.getByRole('link', {
        name: `${post.title} 상세 페이지로 이동`,
      });
      expect(detailLink.getAttribute('href')).toBe(`/top10?rank=${index + 1}`);
      expect(detailLink.closest('button')).toBeNull();
    });

    expect(screen.queryByRole('article')).toBeNull();
  });

  test('omits missing nullable metrics while preserving a real zero', async () => {
    const user = userEvent.setup();
    const screen = renderFeed();

    await user.click(screen.getByRole('button', { name: /1위.*API 첫 번째 글 미리보기/ }));
    expect(screen.queryByLabelText('실제 게시글 지표')).toBeNull();

    await user.click(screen.getByRole('button', { name: /2위.*가장 최신 글 미리보기/ }));

    const metrics = screen.getByLabelText('실제 게시글 지표');
    expect(within(metrics).getByText('조회')).toBeTruthy();
    expect(within(metrics).getByText('0')).toBeTruthy();
    expect(within(metrics).queryByText('좋아요')).toBeNull();
    expect(within(metrics).queryByText('댓글')).toBeNull();
  });

  test('supports keyboard preview selection and excludes an unsafe source URL', async () => {
    const user = userEvent.setup();
    const screen = renderFeed();

    await user.click(screen.getByRole('button', { name: /1위.*API 첫 번째 글 미리보기/ }));
    expect(screen.queryByRole('link', { name: /원문 열기/ })).toBeNull();

    const secondPost = screen.getByRole('button', { name: /2위.*가장 최신 글 미리보기/ });
    secondPost.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('heading', { name: '가장 최신 글' })).toBeTruthy();
    expect(screen.getByRole('link', { name: '원문 열기, 새 탭' }).getAttribute('href')).toBe(
      'https://example.com/b'
    );
  });

  test('shows the available list during a refresh error without inventing values', () => {
    const screen = render(
      <TrendingPostFeed posts={POSTS} isLoading={false} isError featuredTag="AI" />
    );

    expect(
      screen.getByText('최신 목록 갱신에 실패해 현재 확인 가능한 데이터를 표시합니다.')
    ).toBeTruthy();
    expect(screen.getByRole('button', { name: /1위.*API 첫 번째 글 미리보기/ })).toBeTruthy();
  });

  test('uses a text-only preview even when a thumbnail is available', async () => {
    const user = userEvent.setup();
    const { container, getByText, getByRole } = renderFeed([
      { ...POSTS[2], thumbnail: 'https://example.com/missing.jpg' },
    ]);
    await user.click(getByRole('button', { name: /1위.*반응 점수가 가장 높은 글 미리보기/ }));
    expect(container.querySelector('img, svg, canvas, video')).toBeNull();
    expect(getByText('아직 제공된 요약이 없습니다.')).toBeTruthy();
    expect(getByRole('link', { name: '1위 글 자세히 보기' }).getAttribute('href')).toBe(
      '/top10?rank=1'
    );
  });

  test.each([
    { isLoading: true, isError: false },
    { isLoading: false, isError: true },
    { isLoading: false, isError: false },
  ])('keeps the Top 10 entry available when the list is unavailable: %j', (state) => {
    const screen = render(<TrendingPostFeed posts={[]} {...state} />);

    expect(screen.getByRole('link', { name: '[Top 10 전체 보기 >]' }).getAttribute('href')).toBe(
      '/top10'
    );
  });
});

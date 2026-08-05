import type { BoardPost } from 'src/api/board-api';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { Top10List } from 'src/components/top10/top10-list';

type CommentHookParams = {
  boardId: string;
  site: string;
  enabled?: boolean;
};

const mocks = vi.hoisted(() => ({
  useComments: vi.fn(),
  useTopBoards: vi.fn(),
  useTopBoardAnalysis: vi.fn(),
}));

vi.mock('src/hooks/use-top-boards', () => ({
  TOP_BOARDS_LIMIT: 10,
  TOP_BOARDS_TODAY: 'today',
  useTopBoards: mocks.useTopBoards,
}));

vi.mock('src/hooks/use-top-board-analysis', () => ({
  useTopBoardAnalysis: mocks.useTopBoardAnalysis,
}));

vi.mock('src/hooks/use-comments', () => ({
  useComments: mocks.useComments,
}));

const COMPLETE_POST: BoardPost = {
  Id: 'board-original-id',
  category: 'community',
  no: 101,
  site: 'original-site',
  siteLabel: 'Original Site',
  title: 'Runtime fixture post',
  url: 'https://example.com/posts/101',
  contents: [{ type: 'text', text: 'Complete fixture body.' }],
  gptAnswer: 'Complete fixture summary.',
  tags: ['runtime', 'comments'],
  llmEngagementScore: 8,
  llmEngagementReason: 'Useful discussion.',
  analysisStatus: 'done',
  analysisRetryCount: 0,
  analysisError: null,
  createTime: '2026-07-31T10:00:00+09:00',
  thumbnail: null,
  commentCount: 4,
  likeCount: 7,
  nativeCommentCount: 12,
  nativeLikeCount: 6,
  nativeViewCount: 1200,
  sourceRank: 1,
  hotScore: 98.4,
  dailyScore: 91.2,
  metricsCrawledAt: '2026-07-31T10:05:00+09:00',
  scoreUpdatedAt: '2026-07-31T10:06:00+09:00',
};

const POST_WITHOUT_ID: BoardPost = {
  ...COMPLETE_POST,
  Id: null,
  no: 102,
  title: 'Runtime fixture without id',
  url: 'https://example.com/posts/102',
  commentCount: 0,
  sourceRank: 2,
};

function renderPage(posts: BoardPost[]) {
  mocks.useTopBoards.mockReturnValue({
    data: posts,
    isError: false,
    isPending: false,
    isFetching: false,
    refetch: vi.fn(),
  });

  return render(<Top10List variant="page" />);
}

async function expandPost(user: ReturnType<typeof userEvent.setup>, post: BoardPost, rank: number) {
  await user.click(
    screen.getByRole('button', {
      name: `${rank}위 ${post.title} 상세 보기`,
    })
  );
}

describe('Top10List comments', () => {
  beforeEach(() => {
    mocks.useComments.mockReturnValue({
      comments: [],
      totalCount: 0,
      loading: false,
      error: null,
      refetch: vi.fn(),
      creatingComment: false,
      addComment: vi.fn().mockResolvedValue('comment-id'),
      addReply: vi.fn().mockResolvedValue('reply-id'),
      likeComment: vi.fn().mockResolvedValue(undefined),
    });
    mocks.useTopBoardAnalysis.mockReturnValue({
      analysisJobs: {},
      analysisErrors: {},
      isAuthenticated: false,
      requestAnalysis: vi.fn().mockResolvedValue(undefined),
    });
  });

  test('opens the real comment drawer with the post original id and site', async () => {
    const user = userEvent.setup();
    renderPage([COMPLETE_POST]);

    await expandPost(user, COMPLETE_POST, 1);
    await user.click(
      await screen.findByRole('button', {
        name: `${COMPLETE_POST.title} 댓글 열기`,
      })
    );

    expect(mocks.useComments).toHaveBeenLastCalledWith({
      boardId: COMPLETE_POST.Id,
      site: COMPLETE_POST.site,
      enabled: true,
    });
  });

  test('disables comments without an id and never substitutes the row fallback key', async () => {
    const user = userEvent.setup();
    renderPage([POST_WITHOUT_ID]);

    await expandPost(user, POST_WITHOUT_ID, 1);
    const commentAction = await screen.findByRole('button', {
      name: `${POST_WITHOUT_ID.title} 댓글 열기`,
    });

    expect(commentAction).toHaveProperty('disabled', true);

    const commentCalls = mocks.useComments.mock.calls.map(
      ([params]) => params as CommentHookParams
    );
    expect(commentCalls.some(({ enabled }) => enabled === true)).toBe(false);
    expect(
      commentCalls.some(
        ({ boardId }) => boardId === `${POST_WITHOUT_ID.site}-${POST_WITHOUT_ID.no}`
      )
    ).toBe(false);
  });

  test('shows a known zero comment count', async () => {
    const user = userEvent.setup();
    renderPage([POST_WITHOUT_ID]);

    await expandPost(user, POST_WITHOUT_ID, 1);

    expect(
      (
        await screen.findByRole('button', {
          name: `${POST_WITHOUT_ID.title} 댓글 열기`,
        })
      ).textContent
    ).toContain('댓글 0');
  });
});

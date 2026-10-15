import { vi, test, expect } from 'vitest';

import { apiFetch } from 'src/api/http';
import { getDailyIssueBriefing } from 'src/api/board-api';

vi.mock('src/api/http', () => ({ apiFetch: vi.fn() }));

const response = {
  generated_at: '2026-10-11T02:00:00Z',
  date: '2026-10-11',
  started_at: '2026-10-10T15:00:00Z',
  time_zone: 'Asia/Seoul',
  total_posts: 3,
  total_issues: 1,
  source_count: 2,
  issues: [
    {
      id: 'strike',
      rank: 1,
      title: '서울 지하철 파업 예고',
      summary: '노조가 파업을 예고했습니다.',
      post_count: 3,
      source_count: 2,
      sources: [{ site: 'theqoo', site_label: '더쿠', post_count: 2 }],
      posts: [
        {
          board_id: 'strike',
          site: 'theqoo',
          site_label: '더쿠',
          title: '원문 제목',
          url: 'https://example.com/strike',
        },
      ],
    },
  ],
};

test('maps real daily summaries, day boundaries and evidence links without tag rankings', async () => {
  vi.mocked(apiFetch).mockResolvedValueOnce(response);
  const briefing = await getDailyIssueBriefing({ limit: 3, sites: [' theqoo ', ''] });
  expect(apiFetch).toHaveBeenCalledWith(
    '/boardservice/api/boards/issues/briefing?limit=3&sites=theqoo'
  );
  expect(briefing).toMatchObject({
    date: '2026-10-11',
    startedAt: '2026-10-10T15:00:00Z',
    timeZone: 'Asia/Seoul',
    totalPosts: 3,
    issues: [
      {
        rank: 1,
        summarySource: 'ai',
        summary: '노조가 파업을 예고했습니다.',
        postCount: 3,
        sourceCount: 2,
        sources: [{ siteLabel: '더쿠', postCount: 2 }],
        posts: [{ boardId: 'strike', siteLabel: '더쿠', url: 'https://example.com/strike' }],
      },
    ],
  });
});

test('preserves source excerpts and pending summary provenance from the real briefing contract', async () => {
  vi.mocked(apiFetch).mockResolvedValueOnce({
    ...response,
    issues: [
      {
        ...response.issues[0],
        summary: '원문에서 실제로 발췌한 내용입니다.',
        summary_source: 'source_excerpt',
      },
      { ...response.issues[0], id: 'pending', summary: '', summary_source: 'pending' },
    ],
  });
  const briefing = await getDailyIssueBriefing({ limit: 10 });
  expect(briefing.issues.map((issue) => issue.summarySource)).toEqual([
    'source_excerpt',
    'pending',
  ]);
  expect(briefing.issues[0].summary).toBe('원문에서 실제로 발췌한 내용입니다.');
  expect(briefing.issues[1].summary).toBe('');
  expect(briefing.issues[1].posts[0].url).toBe('https://example.com/strike');
});

test('preserves an empty day without borrowing yesterday’s tags or popular posts', async () => {
  vi.mocked(apiFetch).mockResolvedValueOnce({
    ...response,
    total_posts: 0,
    total_issues: 0,
    source_count: 0,
    issues: [],
  });
  const briefing = await getDailyIssueBriefing();
  expect(briefing.issues).toEqual([]);
  expect(briefing.totalPosts).toBe(0);
});

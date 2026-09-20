import { vi, test, expect, describe } from 'vitest';

import { apiFetch } from 'src/api/http';
import { getIssueOverview } from 'src/api/board-api';

vi.mock('src/api/http', () => ({ apiFetch: vi.fn() }));

const OVERVIEW_RESPONSE = {
  generated_at: '2026-09-21T12:30:00Z',
  window_hours: 24,
  total_posts: 12,
  total_tags: 3,
  tags: [
    {
      tag: 'AI',
      post_count: 8,
      current_posts: 6,
      previous_posts: 2,
      impact_score: 42.5,
      share: 0.75,
      momentum_percent: 133.3,
      top_sites: [{ site: 'theqoo', site_label: '더쿠', post_count: 5 }],
      related_tags: ['게임'],
    },
  ],
};

describe('getIssueOverview hourly rankings', () => {
  test('preserves hourly ranks, counts and empty buckets independently of aggregate tags', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce({
      ...OVERVIEW_RESPONSE,
      hourly_rankings: [
        { started_at: '2026-09-21T10:00:00Z', tags: [] },
        {
          started_at: '2026-09-21T11:00:00Z',
          tags: [
            { tag: '게임', post_count: 4, rank: 1 },
            { tag: 'AI', post_count: 2, rank: 2 },
          ],
        },
        {
          started_at: '2026-09-21T12:00:00Z',
          tags: [{ tag: 'AI', post_count: 1, rank: 1 }],
        },
      ],
    });

    const overview = await getIssueOverview({ hours: 24, limit: 1, sites: [' theqoo ', ''] });

    expect(apiFetch).toHaveBeenCalledWith(
      '/boardservice/api/boards/issues?hours=24&limit=1&sites=theqoo'
    );
    expect(overview.hourlyRankings).toEqual([
      { startedAt: '2026-09-21T10:00:00Z', tags: [] },
      {
        startedAt: '2026-09-21T11:00:00Z',
        tags: [
          { tag: '게임', postCount: 4, rank: 1 },
          { tag: 'AI', postCount: 2, rank: 2 },
        ],
      },
      {
        startedAt: '2026-09-21T12:00:00Z',
        tags: [{ tag: 'AI', postCount: 1, rank: 1 }],
      },
    ]);
    expect(overview).toMatchObject({
      generatedAt: '2026-09-21T12:30:00Z',
      windowHours: 24,
      totalPosts: 12,
      totalTags: 3,
      tags: [
        {
          tag: 'AI',
          postCount: 8,
          currentPosts: 6,
          previousPosts: 2,
          impactScore: 42.5,
          share: 0.75,
          momentumPercent: 133.3,
          topSites: [{ site: 'theqoo', siteLabel: '더쿠', postCount: 5 }],
          relatedTags: ['게임'],
        },
      ],
    });
  });

  test('defaults to no hourly rankings for older API responses without inventing history', async () => {
    vi.mocked(apiFetch).mockResolvedValueOnce(OVERVIEW_RESPONSE);

    const overview = await getIssueOverview();

    expect(overview.hourlyRankings).toEqual([]);
    expect(overview.tags[0]).toMatchObject({ tag: 'AI', postCount: 8 });
    expect(overview.totalPosts).toBe(12);
    expect(apiFetch).toHaveBeenCalledWith('/boardservice/api/boards/issues?hours=24&limit=16');
  });
});

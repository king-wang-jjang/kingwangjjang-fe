import { vi, test, expect } from 'vitest';

import { apiFetch } from 'src/api/http';
import { getHourlyPostRankings } from 'src/api/board-api';

vi.mock('src/api/http', () => ({ apiFetch: vi.fn() }));

test('preserves missing hours, capture timestamps and live ranking identity across the API', async () => {
  vi.mocked(apiFetch).mockResolvedValueOnce({
    generated_at: '2026-10-11T15:35:00Z',
    window_hours: 6,
    rankings: [
      { started_at: '2026-10-11T14:00:00Z', captured_at: null, is_live: false, posts: [] },
      {
        started_at: '2026-10-11T15:00:00Z',
        captured_at: '2026-10-11T15:35:00Z',
        is_live: true,
        posts: [
          {
            board_id: 'stable-id',
            rank: 1,
            title: '인기 게시글',
            site: 'dcinside',
            site_label: '디시인사이드',
            url: 'https://example.com/post',
          },
        ],
      },
    ],
  });
  const timeline = await getHourlyPostRankings(6);
  expect(apiFetch).toHaveBeenCalledWith('/boardservice/api/boards/daily/hourly-rankings?hours=6');
  expect(timeline.rankings[0]).toEqual({
    startedAt: '2026-10-11T14:00:00Z',
    capturedAt: null,
    isLive: false,
    posts: [],
  });
  expect(timeline.rankings[1]).toMatchObject({
    capturedAt: '2026-10-11T15:35:00Z',
    isLive: true,
    posts: [
      { boardId: 'stable-id', rank: 1, siteLabel: '디시인사이드', url: 'https://example.com/post' },
    ],
  });
});

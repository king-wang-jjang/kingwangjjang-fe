import type { IssueOverview } from 'src/api/board-api';

import userEvent from '@testing-library/user-event';
import { vi, test, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { TagBriefing, formatMomentum } from 'src/components/issues';

const OVERVIEW: IssueOverview = {
  generatedAt: '2026-08-31T12:00:00Z',
  windowHours: 24,
  totalPosts: 12,
  totalTags: 2,
  tags: [
    {
      tag: '유머',
      postCount: 8,
      currentPosts: 6,
      previousPosts: 2,
      impactScore: 42.5,
      share: 0.75,
      momentumPercent: 133.3,
      topSites: [{ site: 'dcinside', siteLabel: '디시인사이드', postCount: 5 }],
      relatedTags: ['이슈', '일상'],
    },
    {
      tag: '증시',
      postCount: 4,
      currentPosts: 1,
      previousPosts: 3,
      impactScore: 14.2,
      share: 0.25,
      momentumPercent: -50,
      topSites: [{ site: 'ygosu', siteLabel: '와이고수', postCount: 4 }],
      relatedTags: ['주식'],
    },
  ],
};

describe('TagBriefing', () => {
  test('renders AI tag statistics and selects a tag', async () => {
    const user = userEvent.setup();
    const onTagSelect = vi.fn();

    render(<TagBriefing overview={OVERVIEW} onTagSelect={onTagSelect} />);

    expect(screen.getByText('#유머')).toBeTruthy();
    expect(screen.getByText('디시인사이드')).toBeTruthy();
    expect(screen.getByText('+133%')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /#유머/ }));

    expect(onTagSelect).toHaveBeenCalledWith('유머');
  });

  test('clicking the selected tag clears the filter', async () => {
    const user = userEvent.setup();
    const onTagSelect = vi.fn();

    render(<TagBriefing overview={OVERVIEW} selectedTag="증시" onTagSelect={onTagSelect} />);

    await user.click(screen.getByRole('button', { name: /#증시/ }));

    expect(onTagSelect).toHaveBeenCalledWith(undefined);
  });

  test('explains when there are no analyzed tags', () => {
    render(
      <TagBriefing
        overview={{ ...OVERVIEW, totalPosts: 0, totalTags: 0, tags: [] }}
        onTagSelect={() => undefined}
      />
    );

    expect(screen.getByText('아직 집계할 AI 태그가 없습니다.')).toBeTruthy();
    expect(formatMomentum(-50)).toBe('-50%');
  });
});

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

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
      totalCategories: 1,
      categories: [
        {
          category: 'humor',
          postCount: 8,
          currentPosts: 6,
          previousPosts: 2,
          impactScore: 42.5,
          share: 1,
          momentumPercent: 133.3,
          topSites: [{ site: 'dcinside', siteLabel: '디시인사이드', postCount: 8 }],
          topTags: ['이슈', '유머'],
        },
      ],
    },
    isPending: false,
    isError: false,
  }),
}));

describe('HomeView', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('opens the board with the selected issue category', async () => {
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserverMock {
        observe() {}

        unobserve() {}

        disconnect() {}
      }
    );
    const user = userEvent.setup();

    render(<HomeView />);

    const category = document.querySelector<HTMLElement>('[data-category="humor"]');
    expect(category).toBeTruthy();

    await user.click(category!);

    expect(push).toHaveBeenCalledWith('/board?category=humor');
  });
});

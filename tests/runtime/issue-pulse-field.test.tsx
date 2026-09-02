import type { IssueOverview } from 'src/api/board-api';

import userEvent from '@testing-library/user-event';
import { vi, test, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import { formatCategory, IssuePulseField } from 'src/components/issues';

const OVERVIEW: IssueOverview = {
  generatedAt: '2026-08-31T12:00:00Z',
  windowHours: 24,
  totalPosts: 12,
  totalCategories: 2,
  categories: [
    {
      category: 'humor',
      postCount: 8,
      currentPosts: 6,
      previousPosts: 2,
      impactScore: 42.5,
      share: 0.75,
      momentumPercent: 133.3,
      topSites: [{ site: 'dcinside', siteLabel: '디시인사이드', postCount: 5 }],
      topTags: ['이슈', '유머'],
    },
    {
      category: 'stock',
      postCount: 4,
      currentPosts: 1,
      previousPosts: 3,
      impactScore: 14.2,
      share: 0.25,
      momentumPercent: -50,
      topSites: [{ site: 'ygosu', siteLabel: '와이고수', postCount: 4 }],
      topTags: ['증시'],
    },
  ],
};

describe('IssuePulseField', () => {
  test('starts observing its width when asynchronous issue data arrives', () => {
    const observe = vi.fn();
    const disconnect = vi.fn();
    vi.stubGlobal(
      'ResizeObserver',
      class ResizeObserverMock {
        observe = observe;

        unobserve = vi.fn();

        disconnect = disconnect;
      }
    );

    const { rerender, unmount } = render(
      <IssuePulseField isLoading onCategorySelect={() => undefined} />
    );
    expect(observe).not.toHaveBeenCalled();

    rerender(<IssuePulseField overview={OVERVIEW} onCategorySelect={() => undefined} />);

    expect(observe).toHaveBeenCalledOnce();
    unmount();
    expect(disconnect).toHaveBeenCalledOnce();
    vi.unstubAllGlobals();
  });

  test('renders packed category signals and selects a category', async () => {
    const user = userEvent.setup();
    const onCategorySelect = vi.fn();

    render(<IssuePulseField overview={OVERVIEW} onCategorySelect={onCategorySelect} />);

    expect(screen.getByTestId('issue-pulse-field')).toBeTruthy();
    expect(screen.getByText('실시간 시그널 필드')).toBeTruthy();
    expect(screen.getByText('12')).toBeTruthy();

    await user.click(screen.getByRole('button', { name: /유머, 게시물 8개/ }));

    expect(onCategorySelect).toHaveBeenCalledWith('humor');
  });

  test('clicking the selected category clears the filter', async () => {
    const user = userEvent.setup();
    const onCategorySelect = vi.fn();

    render(
      <IssuePulseField
        overview={OVERVIEW}
        selectedCategory="stock"
        onCategorySelect={onCategorySelect}
      />
    );

    await user.click(screen.getByRole('button', { name: /주식, 게시물 4개/ }));

    expect(onCategorySelect).toHaveBeenCalledWith(undefined);
  });

  test('formats known and dynamic category codes for display', () => {
    expect(formatCategory('maple-5974')).toBe('메이플스토리');
    expect(formatCategory('new-topic-1234')).toBe('New topic');
  });
});

import type { IssueHourlyRanking } from 'src/api/board-api';

import userEvent from '@testing-library/user-event';
import { test, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { HourlyTagRankings } from 'src/sections/home/activity/hourly-tag-rankings';

const RANKINGS: IssueHourlyRanking[] = [
  {
    startedAt: '2026-09-20T14:00:00Z',
    tags: [
      { tag: '유머', postCount: 10, rank: 1 },
      { tag: 'AI', postCount: 8, rank: 2 },
      { tag: '게임', postCount: 6, rank: 3 },
    ],
  },
  {
    startedAt: '2026-09-20T15:00:00Z',
    tags: [
      { tag: '유머', postCount: 6, rank: 1 },
      { tag: '게임', postCount: 4, rank: 2 },
      { tag: 'AI', postCount: 2, rank: 4 },
    ],
  },
];

function renderRankings(rankings: IssueHourlyRanking[] = RANKINGS) {
  return render(<HourlyTagRankings rankings={rankings} isLoading={false} isError={false} />);
}

describe('HourlyTagRankings', () => {
  test('places rank 1 above rank 10 and keeps their actual post counts', () => {
    const { container } = renderRankings([
      {
        startedAt: '2026-09-21T12:00:00Z',
        tags: [
          { tag: 'AI', postCount: 1240, rank: 1 },
          { tag: '게임', postCount: 2, rank: 10 },
        ],
      },
    ]);

    const first = container.querySelector('[data-rank-series="AI"] circle');
    const tenth = container.querySelector('[data-rank-series="게임"] circle');

    expect(first).not.toBeNull();
    expect(tenth).not.toBeNull();
    expect(Number(first!.getAttribute('cy'))).toBeLessThan(Number(tenth!.getAttribute('cy')));
    expect(first!.querySelector('title')?.textContent).toContain('1위 / 1,240개 게시글');
    expect(tenth!.querySelector('title')?.textContent).toContain('10위 / 2개 게시글');
    expect((screen.getByRole('slider') as HTMLInputElement).disabled).toBe(true);
  });

  test('breaks the line for an unranked hour and for a missing hour without adding points', () => {
    const { container } = renderRankings([
      {
        startedAt: '2026-09-21T12:00:00Z',
        tags: [{ tag: 'AI', postCount: 5, rank: 1 }],
      },
      { startedAt: '2026-09-21T13:00:00Z', tags: [] },
      {
        startedAt: '2026-09-21T14:00:00Z',
        tags: [{ tag: 'AI', postCount: 3, rank: 3 }],
      },
      {
        startedAt: '2026-09-21T16:00:00Z',
        tags: [{ tag: 'AI', postCount: 2, rank: 2 }],
      },
      {
        startedAt: '2026-09-21T17:00:00Z',
        tags: [{ tag: 'AI', postCount: 4, rank: 1 }],
      },
    ]);

    const series = container.querySelector('[data-rank-series="AI"]')!;

    expect(series.querySelectorAll('circle')).toHaveLength(4);
    expect(series.querySelector('path')!.getAttribute('d')!.match(/[ML]/g)).toEqual([
      'M',
      'M',
      'M',
      'L',
    ]);

    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } });

    expect(
      within(screen.getByRole('list', { name: '선택한 시간의 태그 순위' })).getByText(
        '10위 밖 또는 게시글 없음'
      )
    ).toBeTruthy();
  });

  test('labels the Korean midnight rollover and preserves the selected timestamp', () => {
    const { container } = renderRankings();

    expect(screen.getByText('23시')).toBeTruthy();
    expect(screen.getByText('00시')).toBeTruthy();
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('9. 21. 00:00');
    expect(container.querySelector('time')!.getAttribute('datetime')).toBe(RANKINGS[1].startedAt);

    fireEvent.change(screen.getByRole('slider'), { target: { value: '0' } });

    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('9. 20. 23:00');
    expect(container.querySelector('time')!.getAttribute('datetime')).toBe(RANKINGS[0].startedAt);
  });

  test('changes the visible buckets and time selection with the 6, 12 and 24 hour controls', async () => {
    const user = userEvent.setup();
    const rankings = Array.from({ length: 24 }, (_, index) => ({
      startedAt: new Date(Date.UTC(2026, 8, 20, index)).toISOString(),
      tags: [{ tag: 'AI', postCount: index + 1, rank: (index % 10) + 1 }],
    }));
    const { container } = renderRankings(rankings.toReversed());

    for (const period of [6, 12, 24]) {
      await user.click(screen.getByRole('button', { name: `[${period}시간]` }));

      expect(container.querySelectorAll('[data-rank-series="AI"] circle')).toHaveLength(period);
      expect(screen.getByRole('slider').getAttribute('max')).toBe(String(period - 1));
      expect(
        screen.getByRole('button', { name: `[${period}시간]` }).getAttribute('aria-pressed')
      ).toBe('true');

      fireEvent.change(screen.getByRole('slider'), { target: { value: '0' } });

      expect(container.querySelector('time')!.getAttribute('datetime')).toBe(
        rankings[24 - period].startedAt
      );
      expect(
        screen.getByText(`${rankings[24 - period].tags[0].rank}위 / ${25 - period}개`)
      ).toBeTruthy();

      fireEvent.change(screen.getByRole('slider'), { target: { value: String(period - 1) } });

      expect(container.querySelector('time')!.getAttribute('datetime')).toBe(
        rankings[23].startedAt
      );
    }
  });

  test('selects one tag and updates its rank and count for the chosen hour', async () => {
    const user = userEvent.setup();
    const { container } = renderRankings();

    await user.selectOptions(screen.getByRole('combobox', { name: '비교 태그' }), 'AI');

    expect(container.querySelectorAll('[data-rank-series]')).toHaveLength(1);
    const list = screen.getByRole('list', { name: '선택한 시간의 태그 순위' });
    expect(within(list).getAllByRole('listitem')).toHaveLength(1);
    expect(within(list).getByText('4위 / 2개')).toBeTruthy();

    fireEvent.change(screen.getByRole('slider'), { target: { value: '0' } });

    expect(within(list).getByText('2위 / 8개')).toBeTruthy();
    expect(within(list).queryByText('4위 / 2개')).toBeNull();

    await user.click(within(list).getByRole('button', { name: '#AI' }));

    expect(container.querySelectorAll('[data-rank-series]')).toHaveLength(3);
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('');
  });

  test.each([
    { isLoading: true, isError: false, role: 'status', text: '시간별 태그 순위를 불러오는 중...' },
    {
      isLoading: false,
      isError: false,
      role: 'status',
      text: '아직 표시할 시간별 태그 순위가 없습니다.',
    },
    {
      isLoading: false,
      isError: true,
      role: 'alert',
      text: '시간별 태그 순위를 불러오지 못했습니다.',
    },
  ])('shows the appropriate state without data: $text', ({ isLoading, isError, role, text }) => {
    render(<HourlyTagRankings rankings={[]} isLoading={isLoading} isError={isError} />);

    expect(screen.getByRole(role).textContent).toBe(text);
    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByRole('slider')).toBeNull();
  });

  test('retains the last rankings when refreshing fails', () => {
    const { rerender, container } = renderRankings();
    const before = container.querySelector('[data-rank-series="AI"] path')!.getAttribute('d');

    rerender(<HourlyTagRankings rankings={RANKINGS} isLoading={false} isError />);

    expect(
      within(screen.getByRole('alert'))
        .getByText('갱신에 실패해 마지막 시간별 순위를 표시합니다.')
        .getAttribute('aria-hidden')
    ).toBe('false');
    expect(screen.getByRole('img')).toBeTruthy();
    expect(container.querySelector('[data-rank-series="AI"] path')!.getAttribute('d')).toBe(before);
    expect(screen.getByText('4위 / 2개')).toBeTruthy();
  });
});

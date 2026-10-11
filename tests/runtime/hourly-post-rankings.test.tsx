import type { HourlyPostRanking, HourlyRankedPost } from 'src/api/board-api';

import userEvent from '@testing-library/user-event';
import { test, expect, describe } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';

import { HourlyPostRankings } from 'src/sections/home/activity/hourly-post-rankings';

function post(boardId: string, rank: number, title = '제목 ' + boardId): HourlyRankedPost {
  return {
    boardId,
    rank,
    title,
    site: 'dcinside',
    siteLabel: '디시인사이드',
    url: 'https://example.com/' + boardId,
  };
}
function bucket(
  hour: number,
  posts: HourlyRankedPost[],
  captured = true,
  isLive = false
): HourlyPostRanking {
  const startedAt = new Date(Date.UTC(2026, 9, 11, hour)).toISOString();
  return { startedAt, capturedAt: captured ? startedAt : null, isLive, posts };
}
function renderRankings(rankings: HourlyPostRanking[]) {
  return render(<HourlyPostRankings rankings={rankings} isLoading={false} isError={false} />);
}

describe('HourlyPostRankings', () => {
  test('compares all ten current posts, with rank 1 above rank 10', () => {
    const { container } = renderRankings([
      bucket(
        15,
        Array.from({ length: 10 }, (_, i) => post(String(i), i + 1)),
        true,
        true
      ),
    ]);
    expect(container.querySelectorAll('[data-rank-series]')).toHaveLength(10);
    const first = container.querySelector('[data-rank-series="0"] circle')!;
    const tenth = container.querySelector('[data-rank-series="9"] circle')!;
    expect(Number(first.getAttribute('cy'))).toBeLessThan(Number(tenth.getAttribute('cy')));
    expect(first.querySelector('title')?.textContent).toContain('1위');
    expect(tenth.querySelector('title')?.textContent).toContain('10위');
    expect(screen.getByText(/아직 시간별 기록이 쌓이지 않아 현재 순위만 표시합니다/)).toBeTruthy();
  });

  test('does not invent history and distinguishes missing captures from outside Top 10', () => {
    const { container } = renderRankings([
      bucket(12, [post('a', 1)]),
      bucket(13, [], false),
      bucket(14, [post('a', 3)]),
      bucket(15, []),
      bucket(17, [post('a', 2)]),
      bucket(18, [post('a', 1)], true, true),
    ]);
    const series = container.querySelector('[data-rank-series="a"]')!;
    expect(series.querySelectorAll('circle')).toHaveLength(4);
    expect(series.querySelector('path')!.getAttribute('d')!.match(/[ML]/g)).toEqual([
      'M',
      'M',
      'M',
      'L',
    ]);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } });
    const list = screen.getByRole('list', { name: '선택한 시간의 인기글 순위' });
    expect(within(list).getByText('디시인사이드 / 순위 기록 없음')).toBeTruthy();
    fireEvent.change(screen.getByRole('slider'), { target: { value: '3' } });
    expect(within(list).getByText('디시인사이드 / 10위 밖')).toBeTruthy();
  });

  test('identifies posts by ID even when titles match, and retains the historical title', async () => {
    const user = userEvent.setup();
    const { container } = renderRankings([
      bucket(14, [post('a', 2, '예전 제목'), post('b', 1, '동일 제목')]),
      bucket(15, [post('a', 1, '동일 제목'), post('b', 2, '동일 제목')], true, true),
    ]);
    expect(container.querySelectorAll('[data-rank-series]')).toHaveLength(2);
    await user.selectOptions(screen.getByRole('combobox', { name: '비교 게시글' }), 'a');
    expect(container.querySelectorAll('[data-rank-series]')).toHaveLength(1);
    fireEvent.change(screen.getByRole('slider'), { target: { value: '0' } });
    const list = screen.getByRole('list', { name: '선택한 시간의 인기글 순위' });
    expect(within(list).getByRole('link', { name: '예전 제목' }).getAttribute('href')).toBe(
      'https://example.com/a'
    );
    expect(within(list).getByText('디시인사이드 / 2위')).toBeTruthy();
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('10. 11. 23:00');
    fireEvent.change(screen.getByRole('slider'), { target: { value: '1' } });
    expect(screen.getByRole('slider').getAttribute('aria-valuetext')).toBe('10. 12. 00:00');
  });

  test('supports the three periods and preserves a selected hour after refresh', async () => {
    const user = userEvent.setup();
    const rankings = Array.from({ length: 24 }, (_, i) =>
      bucket(i, [post('a', (i % 10) + 1)], true, i === 23)
    );
    const { container, rerender } = renderRankings(rankings.toReversed());
    for (const period of [6, 12, 24]) {
      await user.click(screen.getByRole('button', { name: '[' + period + '시간]' }));
      expect(container.querySelectorAll('[data-rank-series="a"] circle')).toHaveLength(period);
      expect(screen.getByRole('slider').getAttribute('max')).toBe(String(period - 1));
    }
    fireEvent.change(screen.getByRole('slider'), { target: { value: '20' } });
    rerender(
      <HourlyPostRankings
        rankings={[...rankings.slice(1), bucket(24, [post('a', 1)], true, true)]}
        isLoading={false}
        isError={false}
      />
    );
    expect(container.querySelector('time')!.getAttribute('datetime')).toBe(rankings[20].startedAt);
  });

  test('lets visitors select a historical post which has left the latest Top 10', async () => {
    const user = userEvent.setup();
    const { container } = renderRankings([
      bucket(14, [post('old', 1)]),
      bucket(15, [post('new', 1)], true, true),
    ]);
    expect(container.querySelector('[data-rank-series="old"]')).toBeNull();
    await user.selectOptions(screen.getByRole('combobox'), 'old');
    expect(container.querySelector('[data-rank-series="old"] circle')).toBeTruthy();
    expect(screen.getByText('디시인사이드 / 10위 밖')).toBeTruthy();
  });

  test.each([
    [true, false, 'status', '인기글 순위 변화를 불러오는 중...'],
    [false, false, 'status', '아직 표시할 인기글 순위가 없습니다.'],
    [false, true, 'alert', '인기글 순위 변화를 불러오지 못했습니다.'],
  ])('shows loading, empty and error states (%s, %s)', (isLoading, isError, role, message) => {
    render(
      <HourlyPostRankings
        rankings={[]}
        isLoading={isLoading as boolean}
        isError={isError as boolean}
      />
    );
    expect(screen.getByRole(role as string).textContent).toBe(message);
    expect(screen.queryByRole('img')).toBeNull();
  });

  test('keeps the last successful plot if refresh fails and rejects unsafe source URLs', () => {
    const rankings = [bucket(15, [{ ...post('a', 1), url: 'javascript:alert(1)' }], true, true)];
    const { container, rerender } = renderRankings(rankings);
    expect(screen.queryByRole('link')).toBeNull();
    rerender(<HourlyPostRankings rankings={rankings} isLoading={false} isError />);
    expect(screen.getByRole('alert').textContent).toContain(
      '갱신에 실패해 마지막 인기글 순위를 표시합니다.'
    );
    expect(container.querySelectorAll('circle')).toHaveLength(1);
  });
});

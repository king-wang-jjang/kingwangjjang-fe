import { useQuery } from '@tanstack/react-query';

import { getDailyBoards, getDailyBoardHistory, getDailyBoardHistoryDates } from 'src/api/board-api';

export const TOP_BOARDS_LIMIT = 10;
export const TOP_BOARD_HISTORY_DATES_LIMIT = 30;
export const TOP_BOARDS_TODAY = 'today';
export const TOP_BOARDS_QUERY_KEY = ['boards', 'daily', 'top10'] as const;
export const TOP_BOARD_HISTORY_DATES_QUERY_KEY = [
  ...TOP_BOARDS_QUERY_KEY,
  'history-dates',
] as const;

export function useTopBoards(selectedDate: string = TOP_BOARDS_TODAY) {
  const isToday = selectedDate === TOP_BOARDS_TODAY;

  return useQuery({
    queryKey: [...TOP_BOARDS_QUERY_KEY, selectedDate],
    queryFn: () =>
      isToday
        ? getDailyBoards(0, TOP_BOARDS_LIMIT)
        : getDailyBoardHistory(selectedDate, TOP_BOARDS_LIMIT),
    staleTime: isToday ? 60_000 : Infinity,
    gcTime: isToday ? 5 * 60_000 : Infinity,
  });
}

export function useTopBoardHistoryDates() {
  return useQuery({
    queryKey: TOP_BOARD_HISTORY_DATES_QUERY_KEY,
    queryFn: () => getDailyBoardHistoryDates(TOP_BOARD_HISTORY_DATES_LIMIT),
    staleTime: 5 * 60_000,
  });
}

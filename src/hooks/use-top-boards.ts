import { useQuery } from '@tanstack/react-query';

import { getDailyBoards } from 'src/api/board-api';

export const TOP_BOARDS_LIMIT = 10;
export const TOP_BOARDS_QUERY_KEY = ['boards', 'daily', 'top10'] as const;

export function useTopBoards() {
  return useQuery({
    queryKey: TOP_BOARDS_QUERY_KEY,
    queryFn: () => getDailyBoards(0, TOP_BOARDS_LIMIT),
    staleTime: 60_000,
    placeholderData: (previousData) => previousData,
  });
}

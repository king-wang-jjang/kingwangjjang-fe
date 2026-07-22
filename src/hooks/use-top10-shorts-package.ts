import { useQuery } from '@tanstack/react-query';

import { TOP_BOARDS_TODAY } from 'src/hooks/use-top-boards';

import { getDailyShortsPackage } from 'src/api/board-api';

export const TOP10_SHORTS_PACKAGE_QUERY_KEY = [
  'boards',
  'daily',
  'top10',
  'shorts-package',
] as const;

export function useTop10ShortsPackage(selectedDate: string) {
  const isToday = selectedDate === TOP_BOARDS_TODAY;

  return useQuery({
    queryKey: [...TOP10_SHORTS_PACKAGE_QUERY_KEY, selectedDate],
    queryFn: () => getDailyShortsPackage(isToday ? undefined : selectedDate),
    staleTime: isToday ? 60_000 : Infinity,
    refetchInterval: isToday ? 5 * 60_000 : false,
    refetchIntervalInBackground: false,
  });
}

import { useQuery } from '@tanstack/react-query';

import { getHourlyPostRankings } from 'src/api/board-api';

export function useHourlyPostRankings() {
  return useQuery({
    queryKey: ['boards', 'daily', 'hourly-rankings'],
    queryFn: () => getHourlyPostRankings(),
    staleTime: 60_000,
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });
}

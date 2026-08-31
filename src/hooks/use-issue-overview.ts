import { useQuery } from '@tanstack/react-query';

import { getIssueOverview } from 'src/api/board-api';


const ISSUE_REFRESH_INTERVAL_MS = 2 * 60_000;

export function useIssueOverview(sites: string[] = []) {
  const stableSites = [...sites].sort();

  return useQuery({
    queryKey: ['boards', 'issues', '24h', stableSites],
    queryFn: () => getIssueOverview({ hours: 24, limit: 16, sites: stableSites }),
    staleTime: 60_000,
    refetchInterval: ISSUE_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });
}

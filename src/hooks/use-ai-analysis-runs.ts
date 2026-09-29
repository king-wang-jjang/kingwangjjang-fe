import type { AIAnalysisRunFilters } from 'src/api/ai-resource-api';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  getAIAnalysisRuns,
  retryAIAnalysisRun,
  getAIAnalysisQueueOverview,
} from 'src/api/ai-resource-api';

import { AI_RESOURCES_QUERY_KEY } from './use-ai-resources';

export const AI_ANALYSIS_RUNS_QUERY_KEY = ['ai', 'analysis-runs'] as const;

export function useAIAnalysisRuns(filters: AIAnalysisRunFilters) {
  const queryClient = useQueryClient();
  const runs = useQuery({
    queryKey: [...AI_ANALYSIS_RUNS_QUERY_KEY, filters],
    queryFn: async () => {
      const [list, queue] = await Promise.all([
        getAIAnalysisRuns(filters),
        getAIAnalysisQueueOverview(),
      ]);
      return { ...list, queue };
    },
    staleTime: 4_000,
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  });
  const retry = useMutation({
    mutationFn: retryAIAnalysisRun,
    retry: false,
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: AI_ANALYSIS_RUNS_QUERY_KEY }),
        queryClient.invalidateQueries({ queryKey: AI_RESOURCES_QUERY_KEY }),
      ]),
  });

  return {
    ...runs,
    retryRun: retry.mutateAsync,
    isRetrying: retry.isPending,
    retryingBoardId: retry.isPending ? retry.variables : null,
  };
}

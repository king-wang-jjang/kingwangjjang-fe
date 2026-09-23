import type { BoardPost, BoardListFilters } from 'src/api/board-api';

import { useRef, useMemo, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { getRealtimeBoards } from 'src/api/board-api';

import { useRecommendedBoards } from './use-recommended-boards';

const BOARD_PAGE_SIZE = 30;
const EMPTY_FILTERS: BoardListFilters = {};
const ANALYSIS_REFRESH_INTERVAL_MS = 3_000;

function hasActiveAnalysis(posts: BoardPost[]): boolean {
  return posts.some(
    (post) => post.analysisStatus === 'pending' || post.analysisStatus === 'processing'
  );
}

const useInfiniteScrollablePostList = (
  filters: BoardListFilters = EMPTY_FILTERS,
  personalized = false
) => {
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const recommendations = useRecommendedBoards(filters, personalized);

  const {
    data: queryData,
    error: realtimeError,
    fetchNextPage: fetchRealtimePage,
    hasNextPage: hasRealtimePage,
    isFetchingNextPage: fetchingRealtimePage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['boards', 'realtime', filters],
    enabled: !personalized,
    queryFn: ({ pageParam }) => getRealtimeBoards(pageParam, BOARD_PAGE_SIZE, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < BOARD_PAGE_SIZE ? undefined : allPages.length,
    refetchInterval: (query) =>
      query.state.data?.pages.some(hasActiveAnalysis) ? ANALYSIS_REFRESH_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
  });

  const error = personalized ? recommendations.error : realtimeError;
  const fetchNextPage = personalized ? recommendations.fetchNextPage : fetchRealtimePage;
  const hasNextPage = personalized ? recommendations.hasNextPage : hasRealtimePage;
  const isFetchingNextPage = personalized
    ? recommendations.isFetchingNextPage
    : fetchingRealtimePage;

  const data = useMemo(
    () => ({
      // Ranking and site diversification are owned by the API.
      // Keep page and row order intact.
      realtimePagination: queryData?.pages.flat() ?? ([] as BoardPost[]),
    }),
    [queryData]
  );

  useEffect(() => {
    let observerRefValue: HTMLDivElement | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage && !error) {
          fetchNextPage();
        }
      },
      { threshold: 1 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
      observerRefValue = loadingRef.current;
    }

    return () => {
      if (observerRefValue) {
        observer.unobserve(observerRefValue);
      }
    };
  }, [error, fetchNextPage, hasNextPage, isFetchingNextPage]);

  const recommendedData = useMemo(
    () => ({ realtimePagination: recommendations.posts }),
    [recommendations.posts]
  );
  return {
    loadingRef,
    data: personalized ? recommendedData : data,
    loading: personalized ? recommendations.loading : isLoading || isFetchingNextPage,
    error,
    refreshRecommendations: recommendations.refresh,
  };
};

export default useInfiniteScrollablePostList;

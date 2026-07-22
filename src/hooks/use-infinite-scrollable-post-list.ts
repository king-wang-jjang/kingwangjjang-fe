import type { BoardPost, BoardListFilters } from 'src/api/board-api';

import { useRef, useMemo, useEffect } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

import { getRealtimeBoards } from 'src/api/board-api';

const BOARD_PAGE_SIZE = 30;
const EMPTY_FILTERS: BoardListFilters = {};
const ANALYSIS_REFRESH_INTERVAL_MS = 3_000;

function hasActiveAnalysis(posts: BoardPost[]): boolean {
  return posts.some(
    (post) => post.analysisStatus === 'pending' || post.analysisStatus === 'processing'
  );
}

const useInfiniteScrollablePostList = (filters: BoardListFilters = EMPTY_FILTERS) => {
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const {
    data: queryData,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['boards', 'realtime', filters],
    queryFn: ({ pageParam }) => getRealtimeBoards(pageParam, BOARD_PAGE_SIZE, filters),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < BOARD_PAGE_SIZE ? undefined : allPages.length,
    refetchInterval: (query) =>
      query.state.data?.pages.some(hasActiveAnalysis) ? ANALYSIS_REFRESH_INTERVAL_MS : false,
    refetchIntervalInBackground: false,
  });

  const data = useMemo(
    () => ({
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

  return { loadingRef, data, loading: isLoading || isFetchingNextPage, error };
};

export default useInfiniteScrollablePostList;

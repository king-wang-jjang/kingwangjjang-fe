import type { BoardPost, BoardAnalysis, BoardListFilters } from 'src/api/board-api';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { getBoardFilterOptions } from 'src/api/board-api';

import useInfiniteScrollablePostList from './use-infinite-scrollable-post-list';

const EMPTY_POSTS: BoardPost[] = [];
const EMPTY_FILTERS: BoardListFilters = {};
const FILTER_REFRESH_INTERVAL_MS = 5 * 60_000;

export const useBoard = (filters: BoardListFilters = EMPTY_FILTERS, personalized = false) => {
  const queryClient = useQueryClient();
  const [postData, setPostData] = useState<BoardPost[]>(EMPTY_POSTS);
  const [postDataSource, setPostDataSource] = useState<object>();
  const boardFilterOptionsQuery = useQuery({
    queryKey: ['boards', 'filters'],
    queryFn: getBoardFilterOptions,
    staleTime: FILTER_REFRESH_INTERVAL_MS,
    refetchInterval: FILTER_REFRESH_INTERVAL_MS,
    refetchIntervalInBackground: false,
  });

  const {
    loadingRef,
    loading: boardContentsQueryLoading,
    error: boardContentsQueryError,
    data: boardContentsData,
    refreshRecommendations,
  } = useInfiniteScrollablePostList(filters, personalized);

  useEffect(() => {
    const modifiedData = boardContentsData?.realtimePagination ?? EMPTY_POSTS;

    setPostData(modifiedData);
    setPostDataSource(boardContentsData);
  }, [boardContentsData]);

  const updatePostAnalysis = useCallback(
    (analysis: BoardAnalysis) => {
      setPostData((current) =>
        current.map((post) =>
          post.Id === analysis.boardId
            ? {
                ...post,
                gptAnswer: analysis.summary ?? post.gptAnswer,
                tags:
                  analysis.status === 'done' || analysis.tags.length ? analysis.tags : post.tags,
                llmEngagementScore: analysis.llmEngagementScore ?? post.llmEngagementScore,
                llmEngagementReason: analysis.llmEngagementReason ?? post.llmEngagementReason,
                analysisStatus: analysis.status,
                analysisRetryCount: analysis.retryCount,
                analysisError: analysis.error,
              }
            : post
        )
      );

      if (analysis.status === 'done') {
        queryClient.invalidateQueries({ queryKey: ['boards', 'realtime'] }).catch(() => undefined);
      }
    },
    [queryClient]
  );

  return {
    refreshRecommendations,
    postData:
      postDataSource === boardContentsData
        ? postData
        : (boardContentsData?.realtimePagination ?? EMPTY_POSTS),
    boardFilterOptions: boardFilterOptionsQuery.data,
    updatePostAnalysis,
    loadingRef,
    boardContentsQueryLoading,
    boardContentsQueryError,
  };
};

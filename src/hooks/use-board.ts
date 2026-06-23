import type { BoardPost, BoardAnalysis, BoardListFilters } from 'src/api/board-api';

import { useState, useEffect, useCallback } from 'react';

import useInfiniteScrollablePostList from './use-infinite-scrollable-post-list';

const EMPTY_POSTS: BoardPost[] = [];
const EMPTY_FILTERS: BoardListFilters = {};

export const useBoard = (filters: BoardListFilters = EMPTY_FILTERS) => {
  const [postData, setPostData] = useState<BoardPost[]>(EMPTY_POSTS);
  const [filterCollection, setFilterCollection] = useState<string[]>([]);

  const {
    loadingRef,
    loading: boardContentsQueryLoading,
    error: boardContentsQueryError,
    data: boardContentsData,
  } = useInfiniteScrollablePostList(filters);

  useEffect(() => {
    const modifiedData = boardContentsData?.realtimePagination ?? EMPTY_POSTS;

    setPostData(modifiedData);

    const uniqueSite = Array.from(
      new Set(
        modifiedData
          .map((item) => item?.site)
          .filter((site) => typeof site === 'string')
          .map(String)
      )
    );

    if (uniqueSite.length > 0) {
      setFilterCollection(uniqueSite);
    }
  }, [boardContentsData]);

  const updatePostAnalysis = useCallback((analysis: BoardAnalysis) => {
    setPostData((current) =>
      current.map((post) =>
        post.Id === analysis.boardId
          ? {
              ...post,
              gptAnswer: analysis.summary ?? post.gptAnswer,
              tags: analysis.status === 'done' || analysis.tags.length ? analysis.tags : post.tags,
              analysisStatus: analysis.status,
              analysisRetryCount: analysis.retryCount,
              analysisError: analysis.error,
            }
          : post
      )
    );
  }, []);

  return {
    postData,
    filterCollection,
    updatePostAnalysis,
    loadingRef,
    boardContentsQueryLoading,
    boardContentsQueryError,
  };
};

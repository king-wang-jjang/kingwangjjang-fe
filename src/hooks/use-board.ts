import type { BoardAnalysis, BoardPost } from 'src/api/board-api';

import { useState, useEffect, useCallback } from 'react';

import useInfiniteScrollablePostList from './use-infinite-scrollable-post-list';

const EMPTY_POSTS: BoardPost[] = [];

export const useBoard = () => {
  const [postData, setPostData] = useState<BoardPost[]>(EMPTY_POSTS);
  const [filterCollection, setFilterCollection] = useState<string[]>([]);

  const {
    loadingRef,
    loading: boardContentsQueryLoading,
    error: boardContentsQueryError,
    data: boardContentsData,
  } = useInfiniteScrollablePostList();

  useEffect(() => {
    const modifiedData = (boardContentsData?.realtimePagination ?? EMPTY_POSTS).map((value) => {
      switch (value?.site) {
        case 'ygosu':
          return { ...value, site: '와이고수' };
        case 'dcinside':
          return { ...value, site: '디시인사이드' };
        case 'ppomppu':
          return { ...value, site: '뽐뿌' };
        default:
          return value;
      }
    });

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
          ? { ...post, gptAnswer: analysis.summary, tags: analysis.tags }
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

import type { BoardPost } from 'src/api/board-api';

import { useState, useEffect } from 'react';

import { POSTITEMS } from 'src/_mock/_board';

import useInfiniteScrollablePostList from './use-infinite-scrollable-post-list';

export const useBoard = () => {
  const [postData, setPostData] = useState<BoardPost[]>(POSTITEMS);
  const [filterCollection, setFilterCollection] = useState<string[]>([]);

  const {
    loadingRef,
    loading: boardContentsQueryLoading,
    error: boardContentsQueryError,
    data: boardContentsData,
  } = useInfiniteScrollablePostList();

  const handleSummaryBoard = (boardId: string, site: string) => {
    console.log('handleSummaryBoard', boardId, site);
  };

  useEffect(() => {
    const modifiedData = (boardContentsData?.realtimePagination ?? POSTITEMS).map((value) => {
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

  return {
    postData,
    filterCollection,
    loadingRef,
    boardContentsQueryLoading,
    boardContentsQueryError,
    handleSummaryBoard,
  };
};

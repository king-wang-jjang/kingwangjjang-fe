import type { RealtimePaginationQuery } from 'src/__generated__/graphql';

import { useState, useEffect } from 'react';
import { useMutation } from '@apollo/client';

import { POSTITEMS } from 'src/_mock/_board';
// import { SummaryBoardDocument } from 'src/__generated__/graphql';

import useInfiniteScrollablePostList from './use-infinite-scrollable-post-list';

export const useBoard = () => {
  const [postData, setPostData] =
    useState<RealtimePaginationQuery['realtimePagination']>(POSTITEMS);
  const [filterCollection, setFilterCollection] = useState<string[]>([]);

  const {
    loadingRef,
    loading: boardContentsQueryLoading,
    error: boardContentsQueryError,
    data: boardContentsData,
  } = useInfiniteScrollablePostList();

  // const [
  //   summaryBoardMutation,
  //   {
  //     data: summaryBoardMutationData,
  //     loading: summaryBoardMutationLoading,
  //     error: summaryBoardMutationError,
  //   },
  // ] = useMutation(SummaryBoardDocument, { refetchQueries: ['BoardContentsByDate'] });

  const handleSummaryBoard = (boardId: string, site: string) => {
    console.log('handleSummaryBoard', boardId, site);
    // summaryBoardMutation({
    //   variables: { boardId: boardId, site: site },
    //   refetchQueries: ['BoardContentsByDate'],
    //   async onQueryUpdated(observableQuery) {
    //     await observableQuery.refetch();
    //   },
    // });
  };

  useEffect(() => {
    const modifiedData = (boardContentsData?.realtimePagination ?? POSTITEMS).map((value: any) => {
      if (value?.site === 'ygosu') {
        return { ...value, site: '와이고수' };
      }
      if (value?.site === 'dcinside') {
        return { ...value, site: '디시인사이드' };
      }
      if (value?.site === 'ppomppu') {
        return { ...value, site: '뽐뿌' };
      }
      return value;
    });

    setPostData(modifiedData);

    const uniqueSite = Array.from(
      new Set(
        modifiedData
          ? modifiedData
              .map((item) => item?.site)
              .filter((site) => typeof site === 'string')
              .map(String)
          : []
      )
    );

    if (uniqueSite !== undefined) {
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

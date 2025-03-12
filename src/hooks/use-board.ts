import type { RealtimePaginationQuery } from 'src/__generated__/graphql';

import { useState, useEffect } from 'react';

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
  // ] = useMutation(SummaryBoardDocument, {
  //   client: boardServiceClient,
  //   refetchQueries: ['BoardContentsByDate'],
  // });

  const handleSummaryBoard = (boardId: string[], site: string) => {
    
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
function markAsRead(arg0: string) {
  throw new Error('Function not implemented.');
}


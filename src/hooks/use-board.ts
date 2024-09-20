import { useState, useEffect } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { RealtimePaginationQuery, SummaryBoardDocument } from 'src/__generated__/graphql';
import { POSTITEMS } from 'src/_mock/_board';
import useInfiniteScrollablePostList from './use-infinite-scrollable-post-list';

export const useBoard = () => {
  const [postData, setPostData] =
    useState<RealtimePaginationQuery['realtimePagination']>(POSTITEMS);
  const [filteredPostData, setFilteredPostData] = useState<
    RealtimePaginationQuery['realtimePagination'] | undefined
  >(POSTITEMS);
  const [filterCollection, setFilterCollection] = useState<FilterCollectionType>();

  const {
    loadingRef,
    loading: boardContentsQueryLoading,
    error: boardContentsQueryError,
    data: boardContentsData,
  } = useInfiniteScrollablePostList();

  const [
    summaryBoardMutation,
    {
      data: summaryBoardMutationData,
      loading: summaryBoardMutationLoading,
      error: summaryBoardMutationError,
    },
  ] = useMutation(SummaryBoardDocument, { refetchQueries: ['BoardContentsByDate'] });

  const handleSummaryBoard = (boardId: string, site: string) => {
    summaryBoardMutation({
      variables: { boardId: boardId, site: site },
      refetchQueries: ['BoardContentsByDate'],
      async onQueryUpdated(observableQuery) {
        await observableQuery.refetch();
      },
    });
  };

  useEffect(() => {
    const modifiedData = (boardContentsData?.realtimePagination ?? POSTITEMS).map((value: any) => {
      if (value?.site === 'ygosu') {
        return { ...value, site: '와이고수' };
      } else if (value?.site === 'dcinside') {
        return { ...value, site: '디시인사이드' };
      } else if (value?.site === 'ppomppu') {
        return { ...value, site: '뽐뿌' };
      }
      return value;
    });

    setPostData(modifiedData);
    setFilteredPostData(modifiedData);

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
      setFilterCollection({ site: uniqueSite });
    }
  }, [boardContentsData]);

  return {
    postData,
    filteredPostData,
    setFilteredPostData,
    filterCollection,
    loadingRef,
    boardContentsQueryLoading,
    boardContentsQueryError,
    handleSummaryBoard,
  };
};

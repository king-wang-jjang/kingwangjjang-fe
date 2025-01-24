import { useQuery } from '@apollo/client';
import { useRef, useState, useEffect } from 'react';

import { RealtimePaginationDocument } from '../__generated__/graphql';

const useInfiniteScrollablePostList = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const loadingRef = useRef(null);
  const { loading, error, data, fetchMore } = useQuery(RealtimePaginationDocument, {
    variables: { index: 0 },
  });

  useEffect(() => {
    console.log('pageIndex', pageIndex);
    if (pageIndex > 0) {
      fetchMore({
        variables: {
          index: pageIndex,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) return previousResult;
          return {
            ...previousResult,
            realtimePagination: [
              ...(previousResult.realtimePagination || []),
              ...(fetchMoreResult.realtimePagination || []),
            ],
          };
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageIndex]);

  useEffect(() => {
    let observerRefValue: any = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && !error) {
          setPageIndex((prevPageIndex) => prevPageIndex + 1);
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
  }, [error, loading]);

  return { loadingRef, data, loading, error };
};

export default useInfiniteScrollablePostList;

import type { BoardPost } from 'src/api/board-api';

import { useRef, useState, useEffect, useCallback } from 'react';

import { getRealtimeBoards } from 'src/api/board-api';

const useInfiniteScrollablePostList = () => {
  const [pageIndex, setPageIndex] = useState(0);
  const [data, setData] = useState<{ realtimePagination: BoardPost[] }>({
    realtimePagination: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(async (index: number) => {
    setLoading(true);
    try {
      const items = await getRealtimeBoards(index);
      setData((prev) => ({
        realtimePagination: index === 0 ? items : [...(prev.realtimePagination || []), ...items],
      }));
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPage(pageIndex);
  }, [loadPage, pageIndex]);

  useEffect(() => {
    let observerRefValue: HTMLDivElement | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && !error) {
          setPageIndex((prev) => prev + 1);
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

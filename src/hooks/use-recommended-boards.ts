import type { BoardListFilters } from 'src/api/board-api';

import { useMemo, useState } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';

import { useAuthStore } from 'src/store/auth-store';
import { useInterestStore } from 'src/store/interest-store';
import { getRecommendations, getRecommendationPosts } from 'src/api/recommendation-api';

export function useRecommendedBoards(filters: BoardListFilters, enabled: boolean) {
  const [generation, setGeneration] = useState(0);
  const { owner, ready } = useInterestStore();
  const { authStatus, user } = useAuthStore();
  const expectedOwner =
    authStatus === 'checking'
      ? null
      : authStatus === 'authenticated' && user
        ? JSON.stringify([user.authProvider, user.userId])
        : 'guest';
  const active = enabled && ready && owner === expectedOwner && owner !== null;
  const snapshot = useQuery({
    queryKey: ['recommendations', expectedOwner, 'snapshot', filters, generation],
    queryFn: async () => {
      if (owner !== 'guest' && useInterestStore.getState().pending.length)
        await useInterestStore.getState().sync();
      return getRecommendations(
        filters,
        owner === 'guest' ? useInterestStore.getState().profile : undefined
      );
    },
    enabled: active,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const items = snapshot.data?.items ?? [];
  const pages = useInfiniteQuery({
    queryKey: ['recommendations', expectedOwner, 'posts', filters, generation, items],
    queryFn: async ({ pageParam }) => ({
      index: pageParam,
      posts: await getRecommendationPosts(items.slice(pageParam * 30, (pageParam + 1) * 30)),
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      (lastPage.index + 1) * 30 < items.length ? lastPage.index + 1 : undefined,
    enabled: active && snapshot.isSuccess && items.length > 0,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  const posts = useMemo(
    () => (active ? (pages.data?.pages.flatMap((page) => page.posts) ?? []) : []),
    [active, pages.data]
  );
  return {
    posts,
    error: snapshot.error || pages.error,
    loading:
      enabled &&
      (!active ||
        snapshot.isLoading ||
        (items.length > 0 && pages.isLoading) ||
        pages.isFetchingNextPage),
    fetchNextPage: pages.fetchNextPage,
    hasNextPage: pages.hasNextPage,
    isFetchingNextPage: pages.isFetchingNextPage,
    refresh: () => setGeneration((value) => value + 1),
  };
}

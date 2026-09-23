import type { InterestProfile, InterestMutation } from 'src/personalization/interests';

import { apiFetch } from './http';
import { normalizeBoardPost } from './board-api';

import type { BoardListFilters } from './board-api';

const ROOT = '/boardservice/api/boards/recommendations';
export type RecommendationItem = { id: string; reason: string };

export function getInterestProfile() {
  return apiFetch<InterestProfile>(`${ROOT}/profile`, { cache: 'no-store' });
}

export function updateInterestProfile(mutations: InterestMutation[]) {
  return apiFetch<InterestProfile>(`${ROOT}/profile`, {
    method: 'POST',
    body: JSON.stringify({ mutations }),
  });
}

export function getRecommendations(filters: BoardListFilters, profile?: InterestProfile) {
  return apiFetch<{ items: RecommendationItem[] }>(ROOT, {
    method: 'POST',
    body: JSON.stringify({
      category: filters.category,
      tag: filters.tag,
      sites: filters.sites,
      profile,
    }),
  });
}

export async function getRecommendationPosts(items: RecommendationItem[]) {
  const posts = await apiFetch<Parameters<typeof normalizeBoardPost>[0][]>(`${ROOT}/posts`, {
    method: 'POST',
    body: JSON.stringify({ ids: items.map((item) => item.id) }),
  });
  return posts.map((post) => ({
    ...normalizeBoardPost(post),
    recommendationReason: items.find((item) => item.id === post._id)?.reason,
  }));
}

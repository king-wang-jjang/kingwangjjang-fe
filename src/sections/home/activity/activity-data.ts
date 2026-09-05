import type { BoardPost, IssueOverview } from 'src/api/board-api';

import { type ActivityScoreOptions, calculateRelativeActivityScores } from './activity-score';

export type ActivitySource = {
  id: string;
  site: string;
  name: string;
  contribution: number;
  contributionRatio: number;
  representativePost?: BoardPost;
};

export type ActivityTopic = {
  id: string;
  rank: number;
  label: string;
  volume: number;
  currentVolume: number;
  previousVolume: number;
  growthRate: number;
  sourceCount: number;
  connectivity: number;
  activityScore: number;
  impactScore: number;
  impactShare: number;
  topSourceContribution: number;
  sources: ActivitySource[];
  relatedTopicIds: string[];
};

export type ActivityConnection = {
  id: string;
  sourceId: string;
  targetId: string;
};

export type ActivityData = {
  generatedAt: string;
  windowHours: number;
  analyzedPostCount: number;
  uniqueTagCount: number;
  returnedTopicCount: number;
  sourceCount: number;
  knownEdgeCount: number;
  topics: ActivityTopic[];
  connections: ActivityConnection[];
};

type ActivityTopicWithoutScore = Omit<ActivityTopic, 'activityScore'>;

/**
 * Adapts the existing issue overview and ranked posts without manufacturing
 * metrics. `sourceCount` only covers sources included in the API breakdown,
 * while `knownEdgeCount` only covers relationships present in `relatedTags`.
 */
export function adaptActivityData(
  overview: IssueOverview,
  posts: readonly BoardPost[] = [],
  scoreOptions: ActivityScoreOptions = {}
): ActivityData {
  const sourceIds = new Set<string>();
  const connectionById = new Map<string, ActivityConnection>();

  const topicDrafts: ActivityTopicWithoutScore[] = overview.tags
    .filter((tag) => normalizeIdentity(tag.tag) !== '')
    .map((tag, index) => {
      const id = toActivityTopicId(tag.tag);
      const volume = toNonNegativeNumber(tag.postCount);
      const relatedTopicIds = Array.from(
        new Set(
          tag.relatedTags
            .filter((relatedTag) => normalizeIdentity(relatedTag) !== '')
            .map(toActivityTopicId)
            .filter((relatedId) => relatedId !== id)
        )
      );
      const sources = tag.topSites
        .filter((source) => normalizeIdentity(source.site) !== '')
        .map((source) => {
          const sourceId = toActivitySourceId(source.site);
          const contribution = toNonNegativeNumber(source.postCount);
          const representativePost = posts.find(
            (post) =>
              normalizeIdentity(post.site) === normalizeIdentity(source.site) &&
              post.tags?.some(
                (postTag) => normalizeIdentity(postTag) === normalizeIdentity(tag.tag)
              )
          );

          sourceIds.add(sourceId);

          return {
            id: sourceId,
            site: source.site,
            name: source.siteLabel,
            contribution,
            contributionRatio: volume > 0 ? Math.min(1, contribution / volume) : 0,
            ...(representativePost ? { representativePost } : {}),
          };
        })
        .sort(
          (left, right) =>
            right.contribution - left.contribution || left.site.localeCompare(right.site)
        );

      relatedTopicIds.forEach((relatedId) => {
        const [sourceId, targetId] = [id, relatedId].sort();
        const edgeId = `edge:${sourceId}->${targetId}`;
        connectionById.set(edgeId, { id: edgeId, sourceId, targetId });
      });

      return {
        id,
        rank: index + 1,
        label: tag.tag,
        volume,
        currentVolume: toNonNegativeNumber(tag.currentPosts),
        previousVolume: toNonNegativeNumber(tag.previousPosts),
        growthRate: toFiniteNumber(tag.momentumPercent),
        sourceCount: sources.length,
        connectivity: relatedTopicIds.length,
        impactScore: toNonNegativeNumber(tag.impactScore),
        impactShare: toNonNegativeNumber(tag.share),
        topSourceContribution: sources[0]?.contribution ?? 0,
        sources,
        relatedTopicIds,
      };
    });

  const scores = calculateRelativeActivityScores(topicDrafts, scoreOptions);
  const topics = topicDrafts
    .map((topic, index) => ({
      ...topic,
      activityScore: scores[index],
    }))
    .sort(
      (left, right) =>
        right.activityScore - left.activityScore ||
        right.impactScore - left.impactScore ||
        left.label.localeCompare(right.label, 'ko-KR')
    )
    .map((topic, index) => ({ ...topic, rank: index + 1 }));
  const connections = Array.from(connectionById.values()).sort((left, right) =>
    left.id.localeCompare(right.id)
  );

  return {
    generatedAt: overview.generatedAt,
    windowHours: overview.windowHours,
    analyzedPostCount: toNonNegativeNumber(overview.totalPosts),
    uniqueTagCount: toNonNegativeNumber(overview.totalTags),
    returnedTopicCount: topics.length,
    sourceCount: sourceIds.size,
    knownEdgeCount: connections.length,
    topics,
    connections,
  };
}

export function toActivityTopicId(label: string) {
  return `topic:${encodeURIComponent(normalizeIdentity(label))}`;
}

export function toActivitySourceId(site: string) {
  return `source:${encodeURIComponent(normalizeIdentity(site))}`;
}

function normalizeIdentity(value: string) {
  return value
    .normalize('NFKC')
    .trim()
    .replace(/^#+\s*/, '')
    .toLocaleLowerCase('en-US');
}

function toNonNegativeNumber(value: number) {
  return Math.max(0, toFiniteNumber(value));
}

function toFiniteNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

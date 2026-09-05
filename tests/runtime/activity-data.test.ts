import type { BoardPost, IssueOverview } from 'src/api/board-api';

import { test, expect, describe } from 'vitest';

import { calculateRelativeActivityScores } from 'src/sections/home/activity/activity-score';
import { adaptActivityData, toActivityTopicId } from 'src/sections/home/activity/activity-data';

const OVERVIEW: IssueOverview = {
  generatedAt: '2026-09-03T12:00:00Z',
  windowHours: 24,
  totalPosts: 18,
  totalTags: 7,
  tags: [
    {
      tag: 'AI',
      postCount: 10,
      currentPosts: 8,
      previousPosts: 2,
      impactScore: 41.2,
      share: 0.52,
      momentumPercent: 200,
      topSites: [
        { site: 'dcinside', siteLabel: '디시인사이드', postCount: 6 },
        { site: 'theqoo', siteLabel: '더쿠', postCount: 4 },
      ],
      relatedTags: ['NVIDIA', '게임'],
    },
    {
      tag: 'NVIDIA',
      postCount: 7,
      currentPosts: 4,
      previousPosts: 3,
      impactScore: 24.8,
      share: 0.31,
      momentumPercent: 25,
      topSites: [{ site: 'dcinside', siteLabel: '디시인사이드', postCount: 5 }],
      relatedTags: ['#ai'],
    },
  ],
};

const POSTS: BoardPost[] = [
  {
    Id: 'wrong-tag',
    category: 'issue',
    no: 1,
    site: 'dcinside',
    siteLabel: '디시인사이드',
    title: '사이트만 같은 게시글',
    url: 'https://example.com/wrong-tag',
    tags: ['스포츠'],
    createTime: '2026-09-03T11:00:00Z',
  },
  {
    Id: 'wrong-site',
    category: 'issue',
    no: 2,
    site: 'fmkorea',
    siteLabel: '에펨코리아',
    title: '태그만 같은 게시글',
    url: 'https://example.com/wrong-site',
    tags: ['AI'],
    createTime: '2026-09-03T10:00:00Z',
  },
  {
    Id: 'real-match',
    category: 'issue',
    no: 3,
    site: 'DCINSIDE',
    siteLabel: '디시인사이드',
    title: '태그와 출처가 모두 같은 게시글',
    url: 'https://example.com/real-match',
    tags: ['#ai'],
    createTime: '2026-09-03T09:00:00Z',
  },
];

describe('adaptActivityData', () => {
  test('maps only real overview metrics and de-duplicates known tag relationships', () => {
    const data = adaptActivityData(OVERVIEW, POSTS);
    const ai = data.topics[0];
    const nvidia = data.topics[1];

    expect(data).toMatchObject({
      generatedAt: OVERVIEW.generatedAt,
      windowHours: 24,
      analyzedPostCount: 18,
      uniqueTagCount: 7,
      returnedTopicCount: 2,
      sourceCount: 2,
      knownEdgeCount: 2,
    });
    expect(ai).toMatchObject({
      id: toActivityTopicId('AI'),
      rank: 1,
      label: 'AI',
      volume: 10,
      currentVolume: 8,
      previousVolume: 2,
      growthRate: 200,
      sourceCount: 2,
      connectivity: 2,
      impactScore: 41.2,
      impactShare: 0.52,
      topSourceContribution: 6,
      relatedTopicIds: [toActivityTopicId('NVIDIA'), toActivityTopicId('게임')],
    });
    expect(ai.sources[0]).toMatchObject({
      site: 'dcinside',
      name: '디시인사이드',
      contribution: 6,
      contributionRatio: 0.6,
    });
    expect(nvidia.relatedTopicIds).toEqual([toActivityTopicId('AI')]);
    expect(data.connections).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          sourceId: [toActivityTopicId('AI'), toActivityTopicId('NVIDIA')].sort()[0],
          targetId: [toActivityTopicId('AI'), toActivityTopicId('NVIDIA')].sort()[1],
        }),
        expect.objectContaining({
          sourceId: [toActivityTopicId('AI'), toActivityTopicId('게임')].sort()[0],
          targetId: [toActivityTopicId('AI'), toActivityTopicId('게임')].sort()[1],
        }),
      ])
    );
  });

  test('attaches a representative post only when both tag and site really match', () => {
    const data = adaptActivityData(OVERVIEW, POSTS);
    const ai = data.topics[0];

    expect(ai.sources.find((source) => source.site === 'dcinside')?.representativePost?.Id).toBe(
      'real-match'
    );
    expect(
      ai.sources.find((source) => source.site === 'theqoo')?.representativePost
    ).toBeUndefined();
  });

  test('creates stable topic IDs across harmless label formatting differences', () => {
    expect(toActivityTopicId(' #ＡＩ ')).toBe(toActivityTopicId('ai'));
    expect(toActivityTopicId('게임')).toBe(toActivityTopicId('게임'));
  });

  test('ranks topics by the configured activity score instead of trusting API order', () => {
    const data = adaptActivityData({
      ...OVERVIEW,
      tags: [
        {
          ...OVERVIEW.tags[0],
          tag: '선행 태그',
          postCount: 1,
          currentPosts: 0,
          previousPosts: 1,
          topSites: [],
          relatedTags: [],
          impactScore: 100,
          momentumPercent: -100,
        },
        {
          ...OVERVIEW.tags[1],
          tag: '활동 태그',
          postCount: 100,
          currentPosts: 80,
          previousPosts: 20,
          topSites: [
            { site: 'dcinside', siteLabel: '디시인사이드', postCount: 60 },
            { site: 'theqoo', siteLabel: '더쿠', postCount: 40 },
          ],
          relatedTags: ['AI', '기술'],
          impactScore: 1,
          momentumPercent: 300,
        },
      ],
    });

    expect(data.topics.map(({ label, rank }) => ({ label, rank }))).toEqual([
      { label: '활동 태그', rank: 1 },
      { label: '선행 태그', rank: 2 },
    ]);
  });
});

describe('calculateRelativeActivityScores', () => {
  test('normalizes volume logarithmically and caps growth outliers', () => {
    const topics = [
      { volume: 9, growthRate: 150, sourceCount: 1, connectivity: 1 },
      { volume: 99, growthRate: 10000, sourceCount: 2, connectivity: 2 },
    ];

    expect(
      calculateRelativeActivityScores(topics, {
        weights: { volume: 1, growthRate: 0, sourceDiversity: 0, connectivity: 0 },
      })
    ).toEqual([50, 100]);
    expect(
      calculateRelativeActivityScores(topics, {
        weights: { volume: 0, growthRate: 1, sourceDiversity: 0, connectivity: 0 },
        growthRateCap: 300,
      })
    ).toEqual([50, 100]);
  });

  test('keeps scores within 0-100 and gives no growth credit to decline', () => {
    const scores = calculateRelativeActivityScores([
      { volume: 1, growthRate: -80, sourceCount: 0, connectivity: 0 },
      { volume: 20, growthRate: Number.POSITIVE_INFINITY, sourceCount: 3, connectivity: 4 },
    ]);

    expect(scores.every((score) => score >= 0 && score <= 100)).toBe(true);
    expect(
      calculateRelativeActivityScores(
        [
          { volume: 1, growthRate: -80, sourceCount: 0, connectivity: 0 },
          { volume: 1, growthRate: 0, sourceCount: 0, connectivity: 0 },
        ],
        { weights: { volume: 0, growthRate: 1, sourceDiversity: 0, connectivity: 0 } }
      )
    ).toEqual([0, 0]);
  });
});

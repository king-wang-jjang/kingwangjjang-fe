import type { ActivityTopic } from 'src/sections/home/activity/activity-data';

import { render } from '@testing-library/react';
import { test, expect, describe } from 'vitest';

import { CrossCommunityStory } from 'src/sections/home/activity/cross-community-story';

const TOPIC: ActivityTopic = {
  id: 'topic:ai',
  rank: 1,
  label: 'AI & 기술',
  volume: 10,
  currentVolume: 8,
  previousVolume: 2,
  growthRate: 200,
  sourceCount: 2,
  connectivity: 3,
  activityScore: 91.4,
  impactScore: 40,
  impactShare: 0.5,
  topSourceContribution: 6,
  relatedTopicIds: [],
  sources: [
    {
      id: 'source:dcinside',
      site: 'dcinside',
      name: '디시인사이드',
      contribution: 6,
      contributionRatio: 0.6,
    },
    {
      id: 'source:theqoo',
      site: 'theqoo',
      name: '더쿠',
      contribution: 4,
      contributionRatio: 0.4,
    },
  ],
};

describe('CrossCommunityStory', () => {
  test('links each real source contribution to the matching board filters', () => {
    const screen = render(<CrossCommunityStory topic={TOPIC} />);
    const sourceLink = screen.getByRole('link', {
      name: /디시인사이드에서 AI & 기술 태그 게시글 6개 보기/,
    });

    expect(sourceLink.getAttribute('href')).toBe(
      '/board?tag=AI+%26+%EA%B8%B0%EC%88%A0&sites=dcinside'
    );
    expect(screen.getByText('6')).toBeTruthy();
    expect(screen.getAllByText('60%').length).toBeGreaterThan(0);
  });

  test('states that no Top 10 post was linked instead of implying pending data', () => {
    const screen = render(<CrossCommunityStory topic={TOPIC} />);

    expect(screen.getAllByText('연결된 Top 10 글 없음')).toHaveLength(2);
    expect(screen.queryByText('대표 게시글 집계 중')).toBeNull();
  });
});

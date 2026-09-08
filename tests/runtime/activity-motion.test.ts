import { test, expect, describe } from 'vitest';
import { createTimeline } from 'animejs';
import {
  ACTIVITY_END,
  SCRUB_TIMELINE_OPTIONS,
  getCrossProgress,
  getStoryProgress,
  getStoryScene,
  getParticleTopics,
  getRankingGeometry,
  getFeaturedGeometry,
  activityMeter,
} from 'src/sections/home/activity/activity-motion';
import {
  calculateActivityLayout,
  getFallbackActivityLayout,
} from 'src/sections/home/activity/activity-layout';
import type { ActivityTopic } from 'src/sections/home/activity/activity-data';

function topic(id: string, volume: number): ActivityTopic {
  return {
    id,
    volume,
    label: id,
    rank: 1,
    currentVolume: volume,
    previousVolume: 0,
    growthRate: 0,
    sourceCount: 0,
    connectivity: 0,
    activityScore: volume,
    impactScore: 0,
    impactShare: 0,
    topSourceContribution: 0,
    sources: [],
    relatedTopicIds: [],
  };
}
describe('Community Pulse motion', () => {
  test('reverses and clamps natural scroll progress with a fixed header', () => {
    expect(getStoryProgress(76, 6000, 824, 76)).toBe(0);
    expect(getStoryProgress(76 - (6000 - 824) / 2, 6000, 824, 76)).toBe(0.5);
    expect(getStoryProgress(-9000, 6000, 824, 76)).toBe(1);
    expect(getStoryProgress(800, 6000, 824, 76)).toBe(0);
    expect(getCrossProgress(ACTIVITY_END)).toBe(0);
    expect(getCrossProgress(1)).toBe(1);
    expect(getCrossProgress(0.2)).toBe(0);
    expect(getStoryScene(0.8)).toBe('featured');
    expect(getStoryScene(0.3)).toBe('universe');
  });
  test('assigns particles to actual topics in proportion to real volume', () => {
    const topics = [topic('large', 75), topic('small', 25)];
    const particles = getParticleTopics(topics);
    expect(particles).toHaveLength(56);
    expect(particles.filter((item) => item.id === 'large')).toHaveLength(42);
    expect(particles.filter((item) => item.id === 'small')).toHaveLength(14);
    expect(getParticleTopics([])).toEqual([]);
    expect(activityMeter(100, 8)).toBe('████████');
    expect(activityMeter(-10, 8)).toBe('░░░░░░░░');
  });
  test.each([
    [390, 784, true],
    [1440, 824, false],
  ] as const)(
    'keeps ranking and featured content inside a %ipx stage',
    (width, height, compact) => {
      const ranking = getRankingGeometry(width, height, compact);
      const featured = getFeaturedGeometry(width, height, compact);
      expect(ranking.y + ranking.gap * (compact ? 4 : 6)).toBeLessThan(height - 60);
      expect(featured.x - featured.width / 2).toBeGreaterThanOrEqual(20);
      expect(featured.x + featured.width / 2).toBeLessThanOrEqual(width - 20);
      expect(featured.y - featured.height / 2).toBeGreaterThan(80);
    }
  );
});
describe('Bounded topic geometry', () => {
  test.each([
    [390, 560],
    [1440, 600],
  ])(
    'keeps real topic identities, size order and collision bounds at %ipx',
    async (width, height) => {
      const topics = Array.from({ length: width < 900 ? 10 : 16 }, (_, index) =>
        topic('tag-' + index, 100 - index * 5)
      );
      const fallback = getFallbackActivityLayout(topics, width, height);
      expect(fallback.map((item) => item.id)).toEqual(topics.map((item) => item.id));
      const { layouts, simulation } = await calculateActivityLayout(topics, [], width, height, {
        compact: width < 900,
      });
      simulation.stop();
      expect(layouts[0].radius).toBeGreaterThan(layouts.at(-1)!.radius);
      layouts.forEach((node, index) => {
        expect(node.x - node.radius).toBeGreaterThanOrEqual(0);
        expect(node.y - node.radius).toBeGreaterThanOrEqual(0);
        expect(node.x + node.radius).toBeLessThanOrEqual(width);
        expect(node.y + node.radius).toBeLessThanOrEqual(height);
        layouts.slice(index + 1).forEach((other) => {
          expect(Math.hypot(node.x - other.x, node.y - other.y)).toBeGreaterThanOrEqual(
            node.radius + other.radius - 0.2
          );
        });
      });
    }
  );
  test('does not start geometry work after cancellation', async () => {
    const controller = new AbortController();
    controller.abort();
    await expect(
      calculateActivityLayout([topic('real', 1)], [], 390, 560, { signal: controller.signal })
    ).rejects.toMatchObject({ name: 'AbortError' });
  });
});

test('restores a held universe shape after jumping backwards from the featured scene', () => {
  const node = { width: 4, opacity: 0 };
  const timeline = createTimeline(SCRUB_TIMELINE_OPTIONS)
    .add(node, { width: [4, 180], opacity: [0, 1], duration: 95 }, 215)
    .add(node, { width: [180, 14], duration: 145 }, 450)
    .add(node, { width: [14, 360], duration: 80 }, 744);
  try {
    timeline.seek(370, true);
    const universe = { ...node };
    timeline.seek(980, true);
    expect(node.width).toBe(360);
    timeline.seek(370, true);
    expect(node).toEqual(universe);
    timeline.seek(0, true);
    expect({ width: node.width, opacity: node.opacity }).toEqual({ width: 4, opacity: 0 });
  } finally {
    timeline.revert();
  }
});

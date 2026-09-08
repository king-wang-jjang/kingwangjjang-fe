import type { ActivityTopic } from './activity-data';

export const ACTIVITY_END = 0.68;
export const STORY_DURATION = 1000;
// Explicit from/to values own the stage; disable replacement composition so
// Anime 4.5 restores held values when scrubbing backwards across scene gaps.
export const SCRUB_TIMELINE_OPTIONS = {
  autoplay: false,
  defaults: { ease: 'inOut(3)', composition: 'none' },
} as const;
export const PARTICLE_COUNT = 56;

export function clampProgress(value: number) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

export function getStoryProgress(
  top: number,
  scrollHeight: number,
  stageHeight: number,
  inset: number
) {
  return clampProgress((inset - top) / Math.max(1, scrollHeight - stageHeight));
}

export function getCrossProgress(progress: number) {
  return clampProgress((progress - ACTIVITY_END) / (1 - ACTIVITY_END));
}

export function getStoryScene(progress: number) {
  if (progress < 0.1224) return 'hero';
  if (progress < 0.238) return 'particles';
  if (progress < 0.442) return 'universe';
  if (progress < 0.68) return 'ranking';
  if (progress < 0.824) return 'featured';
  return 'sources';
}

export function getRankingGeometry(width: number, height: number, compact: boolean) {
  const left = compact ? 30 : Math.max(88, (width - 980) / 2);
  const rowWidth = width - left * 2;
  return {
    x: left,
    y: Math.max(150, height * 0.27),
    gap: Math.min(compact ? 78 : 76, (height - 230) / (compact ? 5 : 7)),
    meterX: rowWidth * 0.4,
    scoreX: rowWidth * 0.77,
    growthX: rowWidth * 0.9,
    meterLength: compact ? (width < 380 ? 8 : 10) : 22,
  };
}

export function getFeaturedGeometry(width: number, height: number, compact: boolean) {
  return {
    x: width / 2,
    y: height * (compact ? 0.27 : 0.52),
    width: compact ? Math.min(286, width - 40) : 360,
    height: compact ? 160 : 200,
  };
}

/** Each representative particle belongs to a real tag, weighted by its post count. */
export function getParticleTopics(topics: readonly ActivityTopic[]) {
  if (!topics.length) return [];
  const total = topics.reduce((sum, topic) => sum + Math.max(0, topic.volume), 0);
  return Array.from({ length: PARTICLE_COUNT }, (_, index) => {
    if (total === 0) return topics[index % topics.length];
    const target = ((index + 0.5) / PARTICLE_COUNT) * total;
    let running = 0;
    return (
      topics.find((topic) => {
        running += Math.max(0, topic.volume);
        return running >= target;
      }) ?? topics[topics.length - 1]
    );
  });
}

export function activityMeter(score: number, length: number) {
  const filled = Math.round(clampProgress(score / 100) * length);
  return `${'█'.repeat(filled)}${'░'.repeat(length - filled)}`;
}

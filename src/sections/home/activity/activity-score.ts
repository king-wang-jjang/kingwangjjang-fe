export type ActivityScoreWeights = Readonly<{
  volume: number;
  growthRate: number;
  sourceDiversity: number;
  connectivity: number;
}>;

export type ActivityScoreOptions = Readonly<{
  weights?: Partial<ActivityScoreWeights>;
  growthRateCap?: number;
}>;

export type ActivityScoreInput = Readonly<{
  volume: number;
  growthRate: number;
  sourceCount: number;
  connectivity: number;
}>;

export const DEFAULT_ACTIVITY_SCORE_WEIGHTS: ActivityScoreWeights = Object.freeze({
  volume: 0.4,
  growthRate: 0.25,
  sourceDiversity: 0.2,
  connectivity: 0.15,
});

export const DEFAULT_ACTIVITY_SCORE_GROWTH_CAP = 300;

/**
 * Produces a relative 0-100 activity score within the supplied topic set.
 *
 * The score is not a measure of social importance. Volume uses a logarithmic
 * scale and positive growth is capped before normalization so that one outlier
 * cannot determine the complete visual hierarchy. A flat or declining topic
 * receives no growth component, while its current volume can still contribute.
 */
export function calculateRelativeActivityScores(
  topics: readonly ActivityScoreInput[],
  options: ActivityScoreOptions = {}
) {
  if (!topics.length) {
    return [];
  }

  const weights = resolveWeights(options.weights);
  const totalWeight = Object.values(weights).reduce((total, weight) => total + weight, 0);
  if (totalWeight === 0) {
    return topics.map(() => 0);
  }

  const growthRateCap = resolveGrowthRateCap(options.growthRateCap);
  const volumes = topics.map((topic) => toNonNegativeNumber(topic.volume));
  const growthRates = topics.map((topic) =>
    Math.min(toNonNegativeNumber(topic.growthRate), growthRateCap)
  );
  const sourceCounts = topics.map((topic) => toNonNegativeNumber(topic.sourceCount));
  const connectivities = topics.map((topic) => toNonNegativeNumber(topic.connectivity));

  const maxVolume = Math.max(...volumes);
  const maxGrowthRate = Math.max(...growthRates);
  const maxSourceCount = Math.max(...sourceCounts);
  const maxConnectivity = Math.max(...connectivities);

  return topics.map((_topic, index) => {
    const volumeScore = normalizeLogarithmically(volumes[index], maxVolume);
    const growthScore = normalizeLinearly(growthRates[index], maxGrowthRate);
    const sourceScore = normalizeLinearly(sourceCounts[index], maxSourceCount);
    const connectivityScore = normalizeLinearly(connectivities[index], maxConnectivity);
    const weightedScore =
      (volumeScore * weights.volume +
        growthScore * weights.growthRate +
        sourceScore * weights.sourceDiversity +
        connectivityScore * weights.connectivity) /
      totalWeight;

    return Math.round(Math.min(100, Math.max(0, weightedScore)) * 10) / 10;
  });
}

function resolveWeights(overrides?: Partial<ActivityScoreWeights>): ActivityScoreWeights {
  return {
    volume: toNonNegativeNumber(overrides?.volume ?? DEFAULT_ACTIVITY_SCORE_WEIGHTS.volume),
    growthRate: toNonNegativeNumber(
      overrides?.growthRate ?? DEFAULT_ACTIVITY_SCORE_WEIGHTS.growthRate
    ),
    sourceDiversity: toNonNegativeNumber(
      overrides?.sourceDiversity ?? DEFAULT_ACTIVITY_SCORE_WEIGHTS.sourceDiversity
    ),
    connectivity: toNonNegativeNumber(
      overrides?.connectivity ?? DEFAULT_ACTIVITY_SCORE_WEIGHTS.connectivity
    ),
  };
}

function resolveGrowthRateCap(value?: number) {
  if (value == null) {
    return DEFAULT_ACTIVITY_SCORE_GROWTH_CAP;
  }

  return toNonNegativeNumber(value);
}

function normalizeLogarithmically(value: number, maximum: number) {
  if (maximum <= 0) {
    return 0;
  }

  return (Math.log1p(value) / Math.log1p(maximum)) * 100;
}

function normalizeLinearly(value: number, maximum: number) {
  if (maximum <= 0) {
    return 0;
  }

  return (value / maximum) * 100;
}

function toNonNegativeNumber(value: number) {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

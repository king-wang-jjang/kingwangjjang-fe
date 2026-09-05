import type { Simulation, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

import type { ActivityTopic, ActivityConnection } from './activity-data';

export type TopicLayout = {
  id: string;
  x: number;
  y: number;
  radius: number;
  rankingX: number;
  rankingY: number;
};

type LayoutNode = SimulationNodeDatum & {
  id: string;
  radius: number;
  activityScore: number;
  clusterIndex: number;
};

type LayoutLink = SimulationLinkDatum<LayoutNode>;

export type ActivityLayoutController = {
  simulation: Simulation<LayoutNode, LayoutLink>;
  layouts: TopicLayout[];
};

const MIN_DESKTOP_RADIUS = 18;
const MAX_DESKTOP_RADIUS = 54;
const MIN_COMPACT_RADIUS = 14;
const MAX_COMPACT_RADIUS = 38;
const COMPACT_LAYOUT_BREAKPOINT = 900;

/**
 * D3 owns only the target geometry. React keeps ownership of the SVG DOM and
 * Anime.js interpolates between these coordinates during scroll.
 */
export async function calculateActivityLayout(
  topics: readonly ActivityTopic[],
  connections: readonly ActivityConnection[],
  width: number,
  height: number
): Promise<ActivityLayoutController> {
  const { forceX, forceY, forceLink, forceManyBody, forceSimulation, forceCollide, forceRadial } =
    await import('d3-force');
  const compact = width < COMPACT_LAYOUT_BREAKPOINT;
  const safeWidth = Math.max(width, 280);
  const safeHeight = Math.max(height, compact ? 560 : 620);
  const centerX = safeWidth / 2;
  const centerY = safeHeight * (compact ? 0.49 : 0.52);
  const maxVolume = Math.max(...topics.map((topic) => topic.volume), 1);
  const sourceIds = Array.from(
    new Set(topics.map((topic) => topic.sources[0]?.id ?? 'source:unknown'))
  );
  const minRadius = compact ? MIN_COMPACT_RADIUS : MIN_DESKTOP_RADIUS;
  const maxRadius = compact ? MAX_COMPACT_RADIUS : MAX_DESKTOP_RADIUS;
  const radiusRange = maxRadius - minRadius;
  const horizontalPadding = compact
    ? Math.min(58, safeWidth * 0.15)
    : Math.min(92, safeWidth * 0.12);
  const verticalPadding = compact ? 108 : 112;

  const nodes: LayoutNode[] = topics.map((topic, index) => {
    const angle = (Math.PI * 2 * index) / Math.max(topics.length, 1) - Math.PI / 2;
    const initialOrbit = Math.min(safeWidth, safeHeight) * (compact ? 0.24 : 0.29);
    const volumeRatio = Math.log1p(topic.volume) / Math.log1p(maxVolume);

    return {
      id: topic.id,
      radius: minRadius + radiusRange * Math.sqrt(volumeRatio),
      activityScore: topic.activityScore,
      clusterIndex: sourceIds.indexOf(topic.sources[0]?.id ?? 'source:unknown'),
      x: centerX + Math.cos(angle) * initialOrbit,
      y: centerY + Math.sin(angle) * initialOrbit,
      vx: 0,
      vy: 0,
    };
  });
  const nodeIds = new Set(nodes.map((node) => node.id));
  const links: LayoutLink[] = connections
    .filter((connection) => nodeIds.has(connection.sourceId) && nodeIds.has(connection.targetId))
    .map((connection) => ({ source: connection.sourceId, target: connection.targetId }));
  const clusterSpan = compact ? safeWidth * 0.42 : safeWidth * 0.62;

  const simulation = forceSimulation<LayoutNode>(nodes)
    .force(
      'link',
      forceLink<LayoutNode, LayoutLink>(links)
        .id((node) => node.id)
        .distance((link) => {
          const source = link.source as LayoutNode;
          const target = link.target as LayoutNode;
          return source.radius + target.radius + (compact ? 44 : 68);
        })
        .strength(0.085)
    )
    .force('charge', forceManyBody<LayoutNode>().strength(compact ? -48 : -82))
    .force(
      'collision',
      forceCollide<LayoutNode>()
        .radius((node) => node.radius + (compact ? 12 : 20))
        .strength(0.96)
        .iterations(2)
    )
    .force(
      'cluster-x',
      forceX<LayoutNode>((node) => {
        const divisor = sourceIds.length - 1;
        const clusterOffset = divisor > 0 ? (node.clusterIndex / divisor - 0.5) * clusterSpan : 0;
        const activityPull = 1 - node.activityScore / 100;
        return centerX + clusterOffset * (0.34 + activityPull * 0.66);
      }).strength(0.085)
    )
    .force(
      'cluster-y',
      forceY<LayoutNode>((node) => {
        const wave =
          sourceIds.length > 1 ? Math.sin((node.clusterIndex + 1) * 1.9) * safeHeight * 0.08 : 0;
        return centerY + wave;
      }).strength(0.08)
    )
    .force(
      'activity-center',
      forceRadial<LayoutNode>(
        (node) => (1 - node.activityScore / 100) * Math.min(safeWidth, safeHeight) * 0.32,
        centerX,
        centerY
      ).strength(0.12)
    )
    .stop();

  for (let tick = 0; tick < 220; tick += 1) {
    simulation.tick();
    nodes.forEach((node) => {
      node.x = clamp(
        node.x ?? centerX,
        horizontalPadding + node.radius,
        safeWidth - horizontalPadding - node.radius
      );
      node.y = clamp(
        node.y ?? centerY,
        verticalPadding + node.radius,
        safeHeight - verticalPadding - node.radius
      );
    });
  }

  const rankingStartY = compact ? 205 : 202;
  const visibleRankCount = Math.min(topics.length, compact ? 5 : 7);
  const availableRankingHeight = Math.max(safeHeight - rankingStartY - 72, 48);
  const rankingGap = Math.min(
    compact ? 66 : 72,
    availableRankingHeight / Math.max(visibleRankCount - 1, 1)
  );
  const rankingX = compact ? Math.max(36, safeWidth * 0.12) : Math.max(72, safeWidth * 0.12);
  const layouts = nodes.map((node, index) => ({
    id: node.id,
    x: clamp(
      node.x ?? centerX,
      horizontalPadding + node.radius,
      safeWidth - horizontalPadding - node.radius
    ),
    y: clamp(
      node.y ?? centerY,
      verticalPadding + node.radius,
      safeHeight - verticalPadding - node.radius
    ),
    radius: node.radius,
    rankingX,
    rankingY: rankingStartY + index * rankingGap,
  }));

  return { simulation, layouts };
}

export function getFallbackActivityLayout(
  topics: readonly ActivityTopic[],
  width: number,
  height: number
) {
  const safeWidth = Math.max(width, 280);
  const safeHeight = Math.max(height, 560);
  const maxVolume = Math.max(...topics.map((topic) => topic.volume), 1);
  const compact = width < COMPACT_LAYOUT_BREAKPOINT;
  const rankingStartY = compact ? 205 : 202;
  const visibleRankCount = Math.min(topics.length, compact ? 5 : 7);
  const availableRankingHeight = Math.max(safeHeight - rankingStartY - 72, 48);
  const rankingGap = Math.min(
    compact ? 66 : 72,
    availableRankingHeight / Math.max(visibleRankCount - 1, 1)
  );
  const columns = Math.max(
    1,
    Math.min(compact ? 3 : 5, Math.ceil(Math.sqrt(topics.length * (compact ? 0.8 : 1.4))))
  );
  const rows = Math.max(1, Math.ceil(topics.length / columns));
  const horizontalPadding = compact ? Math.min(42, safeWidth * 0.13) : 80;
  const verticalPadding = compact ? 108 : 112;
  const cellWidth = (safeWidth - horizontalPadding * 2) / columns;
  const cellHeight = (safeHeight - verticalPadding * 2) / rows;
  const minRadius = compact ? MIN_COMPACT_RADIUS : MIN_DESKTOP_RADIUS;
  const maxRadius = compact ? MAX_COMPACT_RADIUS : MAX_DESKTOP_RADIUS;

  return topics.map<TopicLayout>((topic, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const volumeRatio = Math.log1p(topic.volume) / Math.log1p(maxVolume);
    const desiredRadius = minRadius + Math.sqrt(volumeRatio) * (maxRadius - minRadius);
    const radius = Math.max(10, Math.min(desiredRadius, cellWidth * 0.34, cellHeight * 0.34));

    return {
      id: topic.id,
      x: horizontalPadding + cellWidth * (column + 0.5),
      y: verticalPadding + cellHeight * (row + 0.5),
      radius,
      rankingX: compact ? Math.max(36, safeWidth * 0.12) : Math.max(72, safeWidth * 0.12),
      rankingY: rankingStartY + index * rankingGap,
    };
  });
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

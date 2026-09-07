import type { Simulation, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

import type { ActivityTopic, ActivityConnection } from './activity-data';

export type TopicLayout = { id: string; x: number; y: number; radius: number };
type LayoutNode = SimulationNodeDatum &
  TopicLayout & { activityScore: number; clusterIndex: number };
type LayoutLink = SimulationLinkDatum<LayoutNode>;
type LayoutResult = { simulation: Simulation<LayoutNode, LayoutLink>; layouts: TopicLayout[] };

/** D3 calculates bounded target coordinates only; it never writes to the SVG DOM. */
export async function calculateActivityLayout(
  topics: readonly ActivityTopic[],
  connections: readonly ActivityConnection[],
  width: number,
  height: number
): Promise<LayoutResult> {
  const { forceX, forceY, forceLink, forceManyBody, forceSimulation, forceCollide, forceRadial } =
    await import('d3-force');
  const compact = width < 600;
  const maxVolume = Math.max(...topics.map((topic) => topic.volume), 1);
  const maxRadius = Math.min(
    compact ? 51 : 62,
    Math.sqrt((width * height) / Math.max(topics.length, 1)) * 0.32
  );
  const minRadius = Math.min(30, maxRadius * 0.7);
  const sources = Array.from(new Set(topics.map((topic) => topic.sources[0]?.id ?? 'unknown')));
  const nodes: LayoutNode[] = topics.map((topic, index) => {
    const angle = index * 2.399963;
    const distance = Math.sqrt(index / Math.max(topics.length, 1)) * Math.min(width, height) * 0.38;
    return {
      id: topic.id,
      activityScore: topic.activityScore,
      clusterIndex: sources.indexOf(topic.sources[0]?.id ?? 'unknown'),
      radius:
        minRadius +
        (maxRadius - minRadius) * Math.sqrt(Math.log1p(topic.volume) / Math.log1p(maxVolume)),
      x: width / 2 + Math.cos(angle) * distance,
      y: height / 2 + Math.sin(angle) * distance,
    };
  });
  const ids = new Set(nodes.map((node) => node.id));
  const links: LayoutLink[] = connections
    .filter((link) => ids.has(link.sourceId) && ids.has(link.targetId))
    .map((link) => ({ source: link.sourceId, target: link.targetId }));
  const simulation = forceSimulation(nodes)
    .force(
      'link',
      forceLink<LayoutNode, LayoutLink>(links)
        .id((node) => node.id)
        .distance(
          (link) => (link.source as LayoutNode).radius + (link.target as LayoutNode).radius + 26
        )
        .strength(0.06)
    )
    .force('charge', forceManyBody().strength(-36))
    .force(
      'collision',
      forceCollide<LayoutNode>()
        .radius((node) => node.radius + 7)
        .strength(1)
        .iterations(3)
    )
    .force(
      'x',
      forceX<LayoutNode>(
        (node) =>
          width / 2 +
          (sources.length > 1 ? (node.clusterIndex / (sources.length - 1) - 0.5) * width * 0.36 : 0)
      ).strength(0.035)
    )
    .force('y', forceY(height / 2).strength(0.035))
    .force(
      'activity',
      forceRadial<LayoutNode>(
        (node) => (1 - node.activityScore / 100) * Math.min(width, height) * 0.4,
        width / 2,
        height / 2
      ).strength(0.1)
    )
    .stop();
  for (let tick = 0; tick < (compact ? 120 : 180); tick += 1) {
    simulation.tick();
    nodes.forEach((node) => {
      node.x = Math.min(width - node.radius - 8, Math.max(node.radius + 8, node.x));
      node.y = Math.min(height - node.radius - 8, Math.max(node.radius + 8, node.y));
    });
  }
  return { simulation, layouts: nodes.map(({ id, x, y, radius }) => ({ id, x, y, radius })) };
}

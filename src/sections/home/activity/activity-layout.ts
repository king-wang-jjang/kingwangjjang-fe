import type { Simulation, SimulationNodeDatum, SimulationLinkDatum } from 'd3-force';

import type { ActivityTopic, ActivityConnection } from './activity-data';

export type TopicLayout = { id: string; x: number; y: number; radius: number };
export type ActivityLayoutOptions = { signal?: AbortSignal; compact?: boolean };
type LayoutNode = SimulationNodeDatum &
  TopicLayout & { activityScore: number; clusterIndex: number };
type LayoutLink = SimulationLinkDatum<LayoutNode>;
type LayoutResult = { simulation: Simulation<LayoutNode, LayoutLink>; layouts: TopicLayout[] };

/** Immediately usable geometry keeps the same topic elements visible while D3 loads. */
export function getFallbackActivityLayout(
  topics: readonly ActivityTopic[],
  width: number,
  height: number
): TopicLayout[] {
  return createFallbackLayout(topics, width, height, width < 900);
}

/** D3 calculates bounded targets only. Every simulation stays stopped, including on abort. */
export async function calculateActivityLayout(
  topics: readonly ActivityTopic[],
  connections: readonly ActivityConnection[],
  width: number,
  height: number,
  { signal, compact = width < 900 }: ActivityLayoutOptions = {}
): Promise<LayoutResult> {
  throwIfAborted(signal);
  const { forceX, forceY, forceLink, forceManyBody, forceSimulation, forceCollide, forceRadial } =
    await import('d3-force');
  throwIfAborted(signal);
  const bounds = getBounds(width, height);
  const sources = Array.from(
    new Set(topics.map((topic) => topic.sources[0]?.id ?? 'unknown'))
  ).sort();
  const fallback = createFallbackLayout(topics, bounds.width, bounds.height, compact);
  const nodes: LayoutNode[] = fallback.map((layout, index) => ({
    ...layout,
    activityScore: topics[index].activityScore,
    clusterIndex: sources.indexOf(topics[index].sources[0]?.id ?? 'unknown'),
  }));
  const ids = new Set(nodes.map((node) => node.id));
  const links: LayoutLink[] = connections
    .filter((link) => ids.has(link.sourceId) && ids.has(link.targetId))
    .map((link) => ({ source: link.sourceId, target: link.targetId }));
  const simulation = forceSimulation(nodes).stop();

  try {
    simulation
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
          .radius((node) => node.radius + bounds.gap / 2)
          .strength(1)
          .iterations(3)
      )
      .force(
        'x',
        forceX<LayoutNode>(
          (node) =>
            bounds.width / 2 +
            (sources.length > 1
              ? (node.clusterIndex / (sources.length - 1) - 0.5) * bounds.width * 0.36
              : 0)
        ).strength(0.035)
      )
      .force('y', forceY(bounds.height / 2).strength(0.035))
      .force(
        'activity',
        forceRadial<LayoutNode>(
          (node) => (1 - node.activityScore / 100) * Math.min(bounds.width, bounds.height) * 0.4,
          bounds.width / 2,
          bounds.height / 2
        ).strength(0.1)
      );

    const tickCount = compact ? 120 : 180;
    for (let tick = 0; tick < tickCount; tick += 1) {
      if (tick % 30 === 0) {
        throwIfAborted(signal);
        // Yield between small batches so resize/offscreen cleanup can cancel stale work.
        // eslint-disable-next-line no-await-in-loop
        if (tick > 0) await nextLayoutFrame(signal);
      }
      simulation.tick();
      nodes.forEach((node) => clampNode(node, bounds));
    }

    // Clamping against an edge can reintroduce collisions. Relax only overlap here,
    // retaining D3's source groups and activity placement without another live timer.
    separateNodes(nodes, bounds);
    throwIfAborted(signal);
    return { simulation, layouts: nodes.map(({ id, x, y, radius }) => ({ id, x, y, radius })) };
  } finally {
    simulation.stop();
  }
}

function createFallbackLayout(
  topics: readonly ActivityTopic[],
  width: number,
  height: number,
  compact: boolean
): TopicLayout[] {
  if (!topics.length) return [];
  const bounds = getBounds(width, height);
  const usableWidth = bounds.width - bounds.padding * 2;
  const usableHeight = bounds.height - bounds.padding * 2;
  const columns = Math.min(
    topics.length,
    Math.max(1, Math.round(Math.sqrt((topics.length * usableWidth) / usableHeight)))
  );
  const rows = Math.ceil(topics.length / columns);
  const cellWidth = usableWidth / columns;
  const cellHeight = usableHeight / rows;
  const maxRadius = Math.max(
    0.1,
    Math.min(compact ? 50 : 90, (Math.min(cellWidth, cellHeight) - bounds.gap) / 2)
  );
  const minRadius = Math.min(compact ? 30 : 40, maxRadius * 0.7);
  const maxVolume = Math.max(...topics.map((topic) => Math.max(0, topic.volume)), 1);
  const cells = Array.from({ length: topics.length }, (_, index) => {
    const row = Math.floor(index / columns);
    const itemsInRow = Math.min(columns, topics.length - row * columns);
    return {
      x: bounds.width / 2 + ((index % columns) - (itemsInRow - 1) / 2) * cellWidth,
      y: bounds.padding + (row + 0.5) * cellHeight,
    };
  }).sort(
    (left, right) =>
      Math.hypot(left.x - bounds.width / 2, left.y - bounds.height / 2) -
      Math.hypot(right.x - bounds.width / 2, right.y - bounds.height / 2)
  );
  const ordered = [...topics].sort(
    (left, right) => right.activityScore - left.activityScore || left.id.localeCompare(right.id)
  );
  const byId = new Map(
    ordered.map((topic, index) => [
      topic.id,
      {
        id: topic.id,
        ...cells[index],
        radius:
          minRadius +
          (maxRadius - minRadius) *
            Math.sqrt(Math.log1p(Math.max(0, topic.volume)) / Math.log1p(maxVolume)),
      },
    ])
  );
  return topics.map((topic) => byId.get(topic.id)!);
}

function getBounds(width: number, height: number) {
  const safeWidth = Number.isFinite(width) ? Math.max(1, width) : 1;
  const safeHeight = Number.isFinite(height) ? Math.max(1, height) : 1;
  const padding = Math.min(12, Math.min(safeWidth, safeHeight) * 0.05);
  return {
    width: safeWidth,
    height: safeHeight,
    padding,
    gap: Math.min(12, Math.min(safeWidth, safeHeight) * 0.015),
  };
}

function clampNode(node: TopicLayout, bounds: ReturnType<typeof getBounds>) {
  node.x = Math.min(
    bounds.width - node.radius - bounds.padding,
    Math.max(node.radius + bounds.padding, node.x)
  );
  node.y = Math.min(
    bounds.height - node.radius - bounds.padding,
    Math.max(node.radius + bounds.padding, node.y)
  );
}

function separateNodes(nodes: TopicLayout[], bounds: ReturnType<typeof getBounds>) {
  for (let pass = 0; pass < 80; pass += 1) {
    let maximumOverlap = 0;
    nodes.forEach((left, index) => {
      for (let otherIndex = index + 1; otherIndex < nodes.length; otherIndex += 1) {
        const right = nodes[otherIndex];
        const dx = right.x - left.x || 0.001;
        const dy = right.y - left.y;
        const distance = Math.hypot(dx, dy);
        const overlap = left.radius + right.radius + bounds.gap - distance;
        if (overlap > 0) {
          maximumOverlap = Math.max(maximumOverlap, overlap);
          const shift = overlap / distance / 2;
          left.x -= dx * shift;
          left.y -= dy * shift;
          right.x += dx * shift;
          right.y += dy * shift;
          clampNode(left, bounds);
          clampNode(right, bounds);
        }
      }
    });
    if (maximumOverlap < 0.1) break;
  }
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException('Activity layout was cancelled.', 'AbortError');
}

function nextLayoutFrame(signal?: AbortSignal): Promise<void> {
  throwIfAborted(signal);
  return new Promise((resolve, reject) => {
    const useFrame =
      typeof requestAnimationFrame === 'function' &&
      (typeof document === 'undefined' || !document.hidden);
    let frame = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const abort = () => {
      if (useFrame) cancelAnimationFrame(frame);
      else clearTimeout(timer);
      signal?.removeEventListener('abort', abort);
      reject(new DOMException('Activity layout was cancelled.', 'AbortError'));
    };
    const complete = () => {
      signal?.removeEventListener('abort', abort);
      resolve();
    };
    signal?.addEventListener('abort', abort, { once: true });
    if (useFrame) frame = requestAnimationFrame(complete);
    else timer = setTimeout(complete, 0);
  });
}

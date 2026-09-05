'use client';

import type { Timeline } from 'animejs';
import type { CSSProperties, KeyboardEvent } from 'react';

import { useRef, useMemo, useState, useEffect } from 'react';

import { Box, Alert, Skeleton, ButtonBase, Typography } from '@mui/material';
import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded';

import {
  type TopicLayout,
  calculateActivityLayout,
  getFallbackActivityLayout,
} from './activity-layout';

import type { ActivityData, ActivityTopic } from './activity-data';

// CSS modules stay after application imports to satisfy the repository import groups.
// eslint-disable-next-line perfectionist/sort-imports
import styles from './activity-story.module.css';

type ActivityStoryProps = {
  data?: ActivityData;
  isLoading?: boolean;
  isError?: boolean;
  onTopicSelect: (tag: string) => void;
};

type StageDimensions = {
  width: number;
  height: number;
};

type ForceLayoutState = {
  inputKey: string;
  layouts: TopicLayout[];
};

type ParticleStyle = CSSProperties & {
  '--particle-delay': string;
};

type TopicNodeStyle = CSSProperties & {
  '--node-drift-delay': string;
  '--node-pulse-duration': string;
};

const DESKTOP_TOPIC_LIMIT = 16;
const COMPACT_TOPIC_LIMIT = 10;
const DESKTOP_RANK_LIMIT = 7;
const COMPACT_RANK_LIMIT = 5;
const TIMELINE_DURATION = 1000;
const PARTICLE_GLYPHS = ['·', '•', '●', '◉', '░', '▒', '▓'];
const PARTICLE_COUNT = 56;
const COMPACT_LAYOUT_BREAKPOINT = 900;

export function ActivityStory({
  data,
  isLoading = false,
  isError = false,
  onTopicSelect,
}: ActivityStoryProps) {
  const storyRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const simulationStopRef = useRef<(() => void) | null>(null);
  const [dimensions, setDimensions] = useState<StageDimensions>({ width: 1280, height: 720 });
  const [forceLayoutState, setForceLayoutState] = useState<ForceLayoutState | null>(null);
  const [motionUnavailable, setMotionUnavailable] = useState(false);
  const staticLayout = usePrefersStaticActivity();
  const compact = dimensions.width < COMPACT_LAYOUT_BREAKPOINT;
  const topics = useMemo(
    () => data?.topics.slice(0, compact ? COMPACT_TOPIC_LIMIT : DESKTOP_TOPIC_LIMIT) ?? [],
    [compact, data?.topics]
  );
  const connections = useMemo(() => data?.connections ?? [], [data?.connections]);
  const layoutInputKey = useMemo(
    () =>
      [
        dimensions.width,
        dimensions.height,
        topics
          .map(
            (topic) =>
              `${topic.id}:${topic.volume}:${topic.activityScore}:${topic.sources[0]?.id ?? ''}`
          )
          .join(','),
        connections
          .map((connection) => `${connection.id}:${connection.sourceId}:${connection.targetId}`)
          .join(','),
      ].join('|'),
    [connections, dimensions.height, dimensions.width, topics]
  );
  const fallbackLayouts = useMemo(
    () => getFallbackActivityLayout(topics, dimensions.width, dimensions.height),
    [dimensions.height, dimensions.width, topics]
  );
  const layouts =
    forceLayoutState?.inputKey === layoutInputKey ? forceLayoutState.layouts : fallbackLayouts;

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) {
      return undefined;
    }

    let resizeFrame = 0;
    const updateDimensions = () => {
      resizeFrame = 0;
      const bounds = stage.getBoundingClientRect();
      if (bounds.width > 0 && bounds.height > 0) {
        const nextDimensions = {
          width: Math.round(bounds.width),
          height: Math.round(bounds.height),
        };
        setDimensions((current) =>
          current.width === nextDimensions.width && current.height === nextDimensions.height
            ? current
            : nextDimensions
        );
      }
    };
    const scheduleDimensions = () => {
      if (!resizeFrame) {
        resizeFrame = window.requestAnimationFrame(updateDimensions);
      }
    };
    updateDimensions();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', scheduleDimensions);
      return () => {
        window.removeEventListener('resize', scheduleDimensions);
        if (resizeFrame) {
          window.cancelAnimationFrame(resizeFrame);
        }
      };
    }

    const observer = new ResizeObserver(scheduleDimensions);
    observer.observe(stage);

    return () => {
      observer.disconnect();
      if (resizeFrame) {
        window.cancelAnimationFrame(resizeFrame);
      }
    };
  }, [staticLayout]);

  useEffect(() => {
    if (staticLayout || !topics.length) {
      simulationStopRef.current?.();
      simulationStopRef.current = null;
      setForceLayoutState(null);
      return undefined;
    }

    let cancelled = false;
    let visibilityObserver: IntersectionObserver | null = null;
    const handleCalculationError = () => {
      if (!cancelled) {
        setForceLayoutState(null);
      }
    };

    const calculate = async () => {
      const result = await calculateActivityLayout(
        topics,
        connections,
        dimensions.width,
        dimensions.height
      );
      if (cancelled) {
        result.simulation.stop();
        return;
      }

      simulationStopRef.current?.();
      simulationStopRef.current = () => result.simulation.stop();
      setForceLayoutState({ inputKey: layoutInputKey, layouts: result.layouts });
    };

    const story = storyRef.current;
    if (story && typeof IntersectionObserver !== 'undefined') {
      visibilityObserver = new IntersectionObserver(
        ([entry]) => {
          if (entry?.isIntersecting) {
            calculate().catch(handleCalculationError);
            visibilityObserver?.disconnect();
          }
        },
        { rootMargin: '20% 0px' }
      );
      visibilityObserver.observe(story);
    } else {
      calculate().catch(handleCalculationError);
    }

    return () => {
      cancelled = true;
      visibilityObserver?.disconnect();
      simulationStopRef.current?.();
      simulationStopRef.current = null;
    };
  }, [connections, dimensions.height, dimensions.width, layoutInputKey, staticLayout, topics]);

  useEffect(() => {
    const story = storyRef.current;
    const stage = stageRef.current;
    if (!story || !stage || staticLayout || !topics.length || !layouts.length) {
      return undefined;
    }

    let cancelled = false;
    let frame = 0;
    let timeline: Timeline | null = null;
    let introRevert: (() => void) | null = null;
    let latestProgress = 0;
    let renderedProgress = -1;
    let interactiveNodeElements: SVGGElement[] = [];
    let fallbackList: HTMLOListElement | null = null;
    let fallbackButtons: HTMLButtonElement[] = [];
    let skipLink: HTMLAnchorElement | null = null;
    let currentAccessibleScene = '';
    let storyVisibilityObserver: IntersectionObserver | null = null;
    let storyNearViewport = true;

    const setScene = (progress: number) => {
      const scene =
        progress < 0.18
          ? 'hero'
          : progress < 0.35
            ? 'particles'
            : progress < 0.65
              ? 'universe'
              : progress < 0.9
                ? 'ranking'
                : 'featured';
      stage.dataset.scene = scene;
      stage.style.setProperty('--activity-progress', String(progress));

      if (scene !== currentAccessibleScene) {
        const rankLimit = compact ? COMPACT_RANK_LIMIT : DESKTOP_RANK_LIMIT;
        interactiveNodeElements.forEach((node, index) => {
          const canFocus =
            scene === 'universe' ||
            (scene === 'ranking' && index < rankLimit) ||
            (scene === 'featured' && index === 0);
          node.tabIndex = canFocus ? 0 : -1;
          node.setAttribute('aria-hidden', canFocus ? 'false' : 'true');
          node.style.pointerEvents = canFocus ? 'auto' : 'none';

          if (!canFocus && document.activeElement === node) {
            node.blur();
          }
        });
        const useFallbackList = scene === 'hero' || scene === 'particles';
        fallbackList?.setAttribute('aria-hidden', useFallbackList ? 'false' : 'true');
        fallbackButtons.forEach((button) => {
          button.tabIndex = useFallbackList ? 0 : -1;
          if (!useFallbackList && document.activeElement === button) {
            button.blur();
          }
        });
        if (skipLink) {
          const showSkipLink = scene === 'hero';
          skipLink.tabIndex = showSkipLink ? 0 : -1;
          skipLink.style.pointerEvents = showSkipLink ? 'auto' : 'none';
        }
        currentAccessibleScene = scene;
      }
    };

    const readProgress = () => {
      frame = 0;
      const bounds = story.getBoundingClientRect();
      const stickyTop = Number.parseFloat(window.getComputedStyle(stage).top) || 0;
      const scrollableDistance = Math.max(story.offsetHeight - stage.offsetHeight, 1);
      latestProgress = clamp((stickyTop - bounds.top) / scrollableDistance, 0, 1);
      if (Math.abs(latestProgress - renderedProgress) < 0.0005) {
        return;
      }
      renderedProgress = latestProgress;
      setScene(latestProgress);
      timeline?.seek(latestProgress * TIMELINE_DURATION, true);
    };

    const scheduleProgress = () => {
      if (storyNearViewport && !frame) {
        frame = window.requestAnimationFrame(readProgress);
      }
    };

    const setup = async () => {
      const { animate, stagger, utils, createTimeline } = await import('animejs');
      if (cancelled) {
        return;
      }

      const hero = stage.querySelector('[data-hero-copy]');
      const heroMetrics = stage.querySelectorAll('[data-hero-metric]');
      const heroChrome = stage.querySelectorAll('[data-hero-chrome]');
      const introItems = stage.querySelectorAll('[data-intro-item]');
      const particles = Array.from(stage.querySelectorAll<HTMLElement>('[data-particle]'));
      const nodeElements = Array.from(stage.querySelectorAll<SVGGElement>('[data-topic-node]'));
      interactiveNodeElements = nodeElements;
      fallbackList = story.querySelector('[data-accessible-topic-list]');
      fallbackButtons = Array.from(
        story.querySelectorAll<HTMLButtonElement>('[data-accessible-topic-button]')
      );
      skipLink = stage.querySelector('[data-skip-link]');
      currentAccessibleScene = '';
      renderedProgress = -1;
      const connectorElements = stage.querySelectorAll('[data-connector]');
      const universeHeading = stage.querySelector('[data-universe-heading]');
      const rankingHeading = stage.querySelector('[data-ranking-heading]');
      const featuredHeading = stage.querySelector('[data-featured-heading]');
      const sceneHeadings = [universeHeading, rankingHeading, featuredHeading].filter(
        (element): element is Element => Boolean(element)
      );
      const layoutById = new Map(layouts.map((layout) => [layout.id, layout]));
      const centerX = dimensions.width / 2;
      const centerY = dimensions.height / 2;

      particles.forEach((particle, index) => {
        const origin = getParticleOrigin(index, dimensions.width, dimensions.height);
        utils.set(particle, { x: origin.x, y: origin.y, opacity: 0, scale: 0.4 });
      });
      nodeElements.forEach((node) => {
        const layout = layoutById.get(node.dataset.topicNode ?? '');
        if (layout) {
          utils.set(node, { x: layout.x, y: layout.y, opacity: 0, scale: 0.12 });
        }
      });
      utils.set(connectorElements, { opacity: 0, strokeDashoffset: 1 });
      utils.set(stage.querySelectorAll('[data-ranking-detail]'), { opacity: 0 });
      utils.set(stage.querySelectorAll('[data-ranking-meter]'), { scaleX: 0 });
      utils.set(stage.querySelectorAll('[data-featured-detail]'), { opacity: 0, scale: 0.84 });
      utils.set(sceneHeadings, { opacity: 0, y: 12 });

      const nextTimeline = createTimeline({
        autoplay: false,
        defaults: { ease: 'linear' },
      });

      if (hero) {
        nextTimeline.add(
          hero,
          {
            opacity: [1, 0.018],
            y: [0, -38],
            letterSpacing: ['0em', '0.035em'],
            duration: 185,
          },
          120
        );
      }
      nextTimeline.add(heroMetrics, { opacity: [1, 0], y: [0, -20], duration: 155 }, 155);
      nextTimeline.add(heroChrome, { opacity: [1, 0], y: [0, -12], duration: 150 }, 155);
      nextTimeline.add(
        particles,
        {
          opacity: [0, 0.88],
          scale: [0.4, 1],
          duration: 150,
          delay: stagger(2.2, { from: 'center' }),
        },
        175
      );
      particles.forEach((particle, index) => {
        const layout = layouts[index % layouts.length];
        const offset = getParticleNodeOffset(index, layout.radius);
        nextTimeline?.add(
          particle,
          {
            x: layout.x + offset.x,
            y: layout.y + offset.y,
            opacity: index < layouts.length * 3 ? 0.9 : 0.28,
            scale: index % 7 === 3 ? 1.35 : 0.8,
            duration: 210,
          },
          300 + (index % 8) * 3
        );
      });
      nextTimeline.add(particles, { opacity: 0, scale: 0.25, duration: 110 }, 470);
      nextTimeline.add(
        nodeElements,
        {
          opacity: [0, 1],
          scale: [0.12, 1],
          duration: 180,
          delay: stagger(16, { from: 'center' }),
        },
        335
      );
      nextTimeline.add(
        connectorElements,
        { opacity: [0, 0.5], strokeDashoffset: [1, 0], duration: 150 },
        390
      );
      if (universeHeading) {
        nextTimeline.add(universeHeading, { opacity: [0, 1], y: [12, 0], duration: 120 }, 350);
        nextTimeline.add(universeHeading, { opacity: 0, y: -10, duration: 80 }, 610);
      }
      nextTimeline.add(connectorElements, { opacity: 0, duration: 75 }, 610);
      if (rankingHeading) {
        nextTimeline.add(rankingHeading, { opacity: [0, 1], y: [12, 0], duration: 100 }, 640);
      }

      nodeElements.forEach((node, index) => {
        const layout = layoutById.get(node.dataset.topicNode ?? '');
        const core = node.querySelector('[data-node-core]');
        const universeDetail = node.querySelectorAll('[data-universe-detail]');
        const rankingDetail = node.querySelectorAll('[data-ranking-detail]');
        const rankingMeter = node.querySelector('[data-ranking-meter]');
        const isRankVisible = index < (compact ? COMPACT_RANK_LIMIT : DESKTOP_RANK_LIMIT);
        if (!layout) {
          return;
        }

        nextTimeline?.add(
          node,
          isRankVisible
            ? {
                x: layout.rankingX,
                y: layout.rankingY,
                scale: 1,
                duration: 160,
              }
            : { opacity: 0, scale: 0.45, duration: 120 },
          615 + Math.min(index, 7) * 8
        );
        if (core && isRankVisible) {
          nextTimeline?.add(core, { r: 7, duration: 130 }, 620 + index * 8);
        }
        nextTimeline?.add(universeDetail, { opacity: 0, duration: 90 }, 605);
        if (isRankVisible) {
          nextTimeline?.add(
            rankingDetail,
            { opacity: [0, 1], duration: 115, delay: stagger(18) },
            650 + index * 10
          );
          if (rankingMeter) {
            nextTimeline?.add(rankingMeter, { scaleX: [0, 1], duration: 130 }, 665 + index * 10);
          }
        }
      });

      if (rankingHeading) {
        nextTimeline.add(rankingHeading, { opacity: 0, y: -12, duration: 70 }, 880);
      }
      nodeElements.forEach((node, index) => {
        const core = node.querySelector('[data-node-core]');
        const rankingDetail = node.querySelectorAll('[data-ranking-detail]');
        const featuredDetail = node.querySelector('[data-featured-detail]');

        if (index === 0) {
          nextTimeline?.add(node, { x: centerX, y: centerY, scale: 1, duration: 100 }, 895);
          if (core) {
            nextTimeline?.add(core, { r: compact ? 42 : 56, duration: 95 }, 900);
          }
          nextTimeline?.add(rankingDetail, { opacity: 0, duration: 50 }, 890);
          if (featuredDetail) {
            nextTimeline?.add(
              featuredDetail,
              { opacity: [0, 1], scale: [0.84, 1], duration: 90 },
              905
            );
          }
        } else if (index < (compact ? COMPACT_RANK_LIMIT : DESKTOP_RANK_LIMIT)) {
          nextTimeline?.add(
            node,
            { opacity: 0.045, y: `+=${compact ? 28 : 48}`, duration: 100 },
            895
          );
        }
      });
      if (featuredHeading) {
        nextTimeline.add(featuredHeading, { opacity: [0, 1], y: [12, 0], duration: 80 }, 910);
      }

      timeline = nextTimeline;
      stage.dataset.enhanced = 'true';
      readProgress();

      const introSeen = hasSeenIntro();
      if (!introSeen && latestProgress < 0.04 && introItems.length) {
        const intro = animate(introItems, {
          opacity: { from: 0 },
          y: { from: 18 },
          duration: 720,
          delay: stagger(55),
          ease: 'out(3)',
          onComplete: markIntroSeen,
        });
        introRevert = () => intro.revert();
      }
    };

    window.addEventListener('scroll', scheduleProgress, { passive: true });
    window.addEventListener('resize', scheduleProgress);
    if (typeof IntersectionObserver !== 'undefined') {
      storyVisibilityObserver = new IntersectionObserver(
        ([entry]) => {
          storyNearViewport = Boolean(entry?.isIntersecting);
          if (storyNearViewport) {
            scheduleProgress();
          }
        },
        { rootMargin: '50% 0px' }
      );
      storyVisibilityObserver.observe(story);
    }
    setup().catch(() => {
      if (!cancelled) {
        setMotionUnavailable(true);
      }
    });
    scheduleProgress();

    return () => {
      cancelled = true;
      window.removeEventListener('scroll', scheduleProgress);
      window.removeEventListener('resize', scheduleProgress);
      storyVisibilityObserver?.disconnect();
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
      introRevert?.();
      timeline?.revert();
      interactiveNodeElements.forEach((node) => {
        node.tabIndex = -1;
        node.setAttribute('aria-hidden', 'true');
        node.style.pointerEvents = 'none';
      });
      fallbackList?.setAttribute('aria-hidden', 'false');
      fallbackButtons.forEach((button) => {
        button.tabIndex = 0;
      });
      if (skipLink) {
        skipLink.tabIndex = 0;
        skipLink.style.pointerEvents = 'auto';
      }
      delete stage.dataset.enhanced;
      stage.dataset.scene = 'hero';
      stage.style.removeProperty('--activity-progress');
    };
  }, [compact, dimensions.height, dimensions.width, layouts, staticLayout, topics]);

  if (staticLayout || motionUnavailable) {
    return (
      <ReducedActivityStory
        data={data}
        isLoading={isLoading}
        isError={isError}
        onTopicSelect={onTopicSelect}
      />
    );
  }

  const layoutById = new Map(layouts.map((layout) => [layout.id, layout]));
  const visibleConnections = connections.filter(
    (connection) => layoutById.has(connection.sourceId) && layoutById.has(connection.targetId)
  );

  return (
    <Box
      component="section"
      id="community-pulse"
      ref={storyRef}
      className={styles.story}
      data-has-topics={topics.length ? 'true' : 'false'}
      aria-labelledby="pulse-title"
      aria-describedby="pulse-method-note"
    >
      <Box ref={stageRef} className={styles.stage} data-scene="hero">
        <Box className={styles.stageGrid} aria-hidden="true" />
        <HeroScene data={data} isLoading={isLoading} />

        <Box className={styles.particleLayer} aria-hidden="true">
          {Array.from({ length: PARTICLE_COUNT }).map((_, index) => (
            <span
              key={index}
              data-particle
              className={styles.particle}
              style={{ '--particle-delay': `${index * -73}ms` } as ParticleStyle}
            >
              {PARTICLE_GLYPHS[index % PARTICLE_GLYPHS.length]}
            </span>
          ))}
        </Box>

        {!!topics.length && (
          <TopicStageSvg
            topics={topics}
            connections={visibleConnections}
            layouts={layouts}
            dimensions={dimensions}
            compact={compact}
            onTopicSelect={onTopicSelect}
          />
        )}

        <SceneHeading
          dataAttribute="data-universe-heading"
          eyebrow="TAG RELATION"
          title="태그별 언급량과 연결"
          note="원 크기는 게시글 수, 선은 API의 관련 태그, 중심 거리는 상대 Activity Score입니다."
        />
        <SceneHeading
          dataAttribute="data-ranking-heading"
          eyebrow="TAG RANKING"
          title={`최근 ${data?.windowHours ?? 24}시간 태그 순위`}
          note="Activity Score는 현재 응답 안에서 비교한 상대 지표이며 사회적 중요도를 뜻하지 않습니다."
        />
        <SceneHeading
          dataAttribute="data-featured-heading"
          eyebrow="RANK #1"
          title="1위 태그의 출처 분포"
          note="API가 제공한 출처별 게시글 수로 나누어 표시합니다."
        />

        {isError && (
          <Alert severity="warning" className={styles.alert}>
            24시간 활동 데이터를 불러오지 못했습니다. 아래 인기 글은 계속 확인할 수 있습니다.
          </Alert>
        )}

        {!isLoading && !isError && !topics.length && (
          <Box className={styles.empty}>
            <Typography component="strong">최근 24시간 AI 태그 데이터가 없습니다.</Typography>
            <Typography component="span">분석이 완료된 게시글이 집계되면 표시됩니다.</Typography>
          </Box>
        )}

        <Box className={styles.sceneRail} aria-hidden="true">
          <span>TYPE</span>
          <span>PARTICLE</span>
          <span>UNIVERSE</span>
          <span>RANK</span>
        </Box>
      </Box>

      <ol
        className={styles.screenReaderRanking}
        data-accessible-topic-list
        aria-label="최근 24시간 AI 태그 활동 순위"
      >
        {topics.slice(0, DESKTOP_RANK_LIMIT).map((topic) => (
          <li key={topic.id}>
            <button
              type="button"
              data-accessible-topic-button
              onClick={() => onTopicSelect(topic.label)}
            >
              {topic.rank}위 {topic.label}, 언급 {topic.volume}건, Activity Score{' '}
              {Math.round(topic.activityScore)}, 증가율 {formatGrowth(topic.growthRate)}
            </button>
          </li>
        ))}
      </ol>
      <Typography component="p" id="pulse-method-note" className={styles.screenReaderDescription}>
        Activity Score는 최근 응답 안에서 태그 활동을 비교한 상대 점수이며, 사회적 중요도를 의미하지
        않습니다.
      </Typography>
    </Box>
  );
}

function HeroScene({ data, isLoading }: { data?: ActivityData; isLoading: boolean }) {
  const metrics = [
    {
      className: styles.metricPosts,
      value: data?.analyzedPostCount,
      label: 'ANALYZED POSTS',
    },
    { className: styles.metricTags, value: data?.uniqueTagCount, label: 'UNIQUE AI TAGS' },
    { className: styles.metricLinks, value: data?.knownEdgeCount, label: 'KNOWN LINKS' },
    { className: styles.metricSources, value: data?.sourceCount, label: 'VISIBLE SOURCES' },
  ];

  return (
    <Box className={styles.heroScene}>
      <Box className={styles.heroTopline} data-hero-chrome>
        <Typography component="span" data-intro-item>
          24H COMMUNITY REPORT
        </Typography>
        <Typography component="span" className={styles.liveLabel} data-intro-item>
          <i /> LIVE · 최근 {data?.windowHours ?? 24}시간
        </Typography>
      </Box>

      <Box data-hero-copy className={styles.heroCopy}>
        <Typography component="p" data-intro-item>
          수집 게시글 기준 · AI 태그 통계
        </Typography>
        <Typography component="h1" id="pulse-title" data-intro-item>
          최근 24시간
          <br /> 커뮤니티 동향
        </Typography>
        <Typography component="p" className={styles.heroDescription} data-intro-item>
          수집한 게시글의 AI 태그를 기준으로 언급량, 증감, 출처 분포를 집계합니다.
        </Typography>
      </Box>

      {metrics.map((metric) => (
        <Box key={metric.label} data-hero-metric className={`${styles.metric} ${metric.className}`}>
          {isLoading ? (
            <Skeleton width={88} height={50} data-intro-item />
          ) : (
            <Typography component="strong" data-intro-item>
              {formatCount(metric.value)}
            </Typography>
          )}
          <Typography component="span" data-intro-item>
            {metric.label}
          </Typography>
        </Box>
      ))}

      <Box
        component="a"
        href="#popular-feed"
        className={styles.skipLink}
        data-hero-chrome
        data-skip-link
      >
        인기글 바로 보기 <ArrowDownwardRoundedIcon />
      </Box>
    </Box>
  );
}

function TopicStageSvg({
  topics,
  connections,
  layouts,
  dimensions,
  compact,
  onTopicSelect,
}: {
  topics: ActivityTopic[];
  connections: ActivityData['connections'];
  layouts: TopicLayout[];
  dimensions: StageDimensions;
  compact: boolean;
  onTopicSelect: (tag: string) => void;
}) {
  const layoutById = new Map(layouts.map((layout) => [layout.id, layout]));
  const constrained = dimensions.width < 900;
  const meterLength = compact ? (dimensions.width < 380 ? 8 : 10) : constrained ? 12 : 18;
  const featuredWidth = compact ? Math.min(286, dimensions.width - 32) : 460;
  const featuredHeight = compact ? 210 : 228;

  return (
    <svg
      className={styles.topicSvg}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
      role="group"
      aria-label="실제 AI 태그 언급량과 연결 관계가 활동 순위로 재배열되는 시각화"
      preserveAspectRatio="xMidYMid meet"
    >
      <g className={styles.connectors} aria-hidden="true">
        {connections.map((connection) => {
          const source = layoutById.get(connection.sourceId);
          const target = layoutById.get(connection.targetId);
          if (!source || !target) {
            return null;
          }

          return (
            <line
              key={connection.id}
              data-connector
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              pathLength="1"
            />
          );
        })}
      </g>

      <g className={styles.topicNodes}>
        {topics.map((topic, index) => {
          const layout = layoutById.get(topic.id);
          if (!layout) {
            return null;
          }
          const sourceGlyphs = Array.from({ length: Math.min(topic.sourceCount, 3) })
            .map(() => '●')
            .join('');
          const meter = buildAsciiMeter(topic.activityScore, meterLength);
          const rankingGrowthX = compact
            ? dimensions.width - layout.rankingX - 48
            : Math.min(672, dimensions.width - layout.rankingX - 84);
          const rankingScoreX = rankingGrowthX - (compact ? 42 : 62);
          const rankingMeterX = compact ? 110 : Math.min(270, rankingScoreX - 260);
          const nodeStyle: TopicNodeStyle = {
            '--node-drift-delay': `${index * -317}ms`,
            '--node-pulse-duration': `${getPulseDuration(topic.growthRate)}ms`,
          };

          return (
            <g
              key={topic.id}
              data-topic-node={topic.id}
              data-growing={topic.growthRate > 0 ? 'true' : undefined}
              className={styles.topicNode}
              style={nodeStyle}
              role="button"
              tabIndex={-1}
              aria-hidden="true"
              aria-label={`${topic.label}, 언급 ${topic.volume}건, Activity Score ${Math.round(topic.activityScore)}`}
              onClick={() => onTopicSelect(topic.label)}
              onKeyDown={(event) => handleTopicKeyDown(event, topic.label, onTopicSelect)}
            >
              <title>
                {topic.label}: 언급 {topic.volume}건, {formatGrowth(topic.growthRate)}
              </title>
              <g className={styles.nodeGlyph}>
                <rect
                  className={styles.rankingHitArea}
                  x={compact ? -42 : -60}
                  y={-26}
                  width={Math.max(220, dimensions.width - layout.rankingX - (compact ? 14 : 32))}
                  height={52}
                  rx={12}
                />
                <circle
                  data-node-core
                  className={styles.nodeCore}
                  r={layout.radius}
                  data-rank={index + 1}
                />
                <circle data-universe-detail className={styles.nodeRing} r={layout.radius + 7} />
                <text data-universe-detail className={styles.nodeLabel} textAnchor="middle" y={-2}>
                  {truncateLabel(topic.label, compact ? 8 : 12)}
                </text>
                <text data-universe-detail className={styles.nodeMeta} textAnchor="middle" y={16}>
                  {topic.volume} · {sourceGlyphs || '·'}
                </text>

                <g data-ranking-detail className={styles.rankingDetail}>
                  <text x={compact ? -30 : -48} y={5} className={styles.rankingNumber}>
                    {String(index + 1).padStart(2, '0')}
                  </text>
                  <text x={compact ? 18 : 28} y={5} className={styles.rankingLabel}>
                    {truncateLabel(topic.label, compact ? 7 : constrained ? 8 : 14)}
                  </text>
                  <text data-ranking-meter x={rankingMeterX} y={5} className={styles.rankingMeter}>
                    {meter}
                  </text>
                  <text x={rankingScoreX} y={5} className={styles.rankingScore}>
                    {Math.round(topic.activityScore)}
                  </text>
                  <text x={rankingGrowthX} y={5} className={styles.rankingGrowth}>
                    {formatGrowth(topic.growthRate)}
                  </text>
                </g>

                {index === 0 && (
                  <g data-featured-detail className={styles.featuredDetail}>
                    <rect
                      x={-featuredWidth / 2}
                      y={-featuredHeight / 2}
                      width={featuredWidth}
                      height={featuredHeight}
                      rx={compact ? 22 : 28}
                    />
                    <text x={-featuredWidth / 2 + 28} y={-featuredHeight / 2 + 38}>
                      TRENDING #1
                    </text>
                    <text className={styles.featuredLabel} textAnchor="middle" y={-10}>
                      #{truncateLabel(topic.label, compact ? 10 : 18)}
                    </text>
                    <text className={styles.featuredScore} textAnchor="middle" y={32}>
                      ACTIVITY {Math.round(topic.activityScore)} · {formatGrowth(topic.growthRate)}
                    </text>
                    <text className={styles.featuredMeta} textAnchor="middle" y={64}>
                      언급 {formatCount(topic.volume)}건 · 표시 출처 {topic.sourceCount}곳
                    </text>
                  </g>
                )}
              </g>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

function SceneHeading({
  dataAttribute,
  eyebrow,
  title,
  note,
}: {
  dataAttribute: string;
  eyebrow: string;
  title: string;
  note: string;
}) {
  return (
    <Box {...{ [dataAttribute]: '' }} className={styles.sceneHeading} aria-hidden="true">
      <Typography component="span">{eyebrow}</Typography>
      <Typography component="strong">{title}</Typography>
      <Typography component="p">{note}</Typography>
    </Box>
  );
}

function ReducedActivityStory({ data, isLoading, isError, onTopicSelect }: ActivityStoryProps) {
  const topics = data?.topics.slice(0, COMPACT_TOPIC_LIMIT) ?? [];

  return (
    <Box
      component="section"
      id="community-pulse"
      className={styles.reducedStory}
      aria-labelledby="pulse-title-reduced"
      aria-describedby="pulse-description-reduced"
    >
      <Box className={styles.reducedHero}>
        <Typography component="span" className={styles.reducedKicker}>
          24H COMMUNITY REPORT · {data?.windowHours ?? 24}시간
        </Typography>
        <Typography component="h1" id="pulse-title-reduced">
          최근 24시간
          <br /> 커뮤니티 동향
        </Typography>
        <Typography component="p" id="pulse-description-reduced">
          수집한 게시글의 AI 태그를 기준으로 언급량, 증감, 출처 분포를 집계합니다. Activity Score는
          현재 응답 안에서만 비교합니다.
        </Typography>
        <Box className={styles.reducedMetrics}>
          <span>{formatCount(data?.analyzedPostCount)} 분석 글</span>
          <span>{formatCount(data?.uniqueTagCount)} 고유 태그</span>
          <span>{formatCount(data?.knownEdgeCount)} 알려진 연결</span>
          <span>{formatCount(data?.sourceCount)} 표시 출처</span>
        </Box>
      </Box>

      {isError && <Alert severity="warning">24시간 AI 태그 데이터를 불러오지 못했습니다.</Alert>}
      {isLoading && <Skeleton variant="rounded" height={320} />}
      {!isLoading && !isError && (
        <Box className={styles.reducedGrid}>
          <Box className={styles.reducedUniverse}>
            <Typography component="h2">태그별 언급량</Typography>
            <Box>
              {topics.map((topic) => (
                <ButtonBase key={topic.id} onClick={() => onTopicSelect(topic.label)}>
                  <strong>#{topic.label}</strong>
                  <span>● {topic.volume}건</span>
                </ButtonBase>
              ))}
            </Box>
          </Box>
          <Box className={styles.reducedRanking}>
            <Typography component="h2">최근 24시간 태그 순위</Typography>
            <ol>
              {topics.slice(0, COMPACT_RANK_LIMIT).map((topic) => (
                <li key={topic.id}>
                  <button type="button" onClick={() => onTopicSelect(topic.label)}>
                    <span>{String(topic.rank).padStart(2, '0')}</span>
                    <strong>{topic.label}</strong>
                    <code>{buildAsciiMeter(topic.activityScore, 8)}</code>
                    <em>{Math.round(topic.activityScore)}</em>
                    <small>{formatGrowth(topic.growthRate)}</small>
                  </button>
                </li>
              ))}
            </ol>
          </Box>
        </Box>
      )}
    </Box>
  );
}

function usePrefersStaticActivity() {
  const [staticLayout, setStaticLayout] = useState(false);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce), (max-height: 700px)');
    const updatePreference = () => setStaticLayout(query.matches);
    updatePreference();
    query.addEventListener?.('change', updatePreference);

    return () => query.removeEventListener?.('change', updatePreference);
  }, []);

  return staticLayout;
}

function handleTopicKeyDown(
  event: KeyboardEvent<SVGGElement>,
  label: string,
  onTopicSelect: (tag: string) => void
) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    onTopicSelect(label);
  }
}

function getParticleOrigin(index: number, width: number, height: number) {
  const column = index % 14;
  const row = Math.floor(index / 14);
  const spreadX = Math.min(width * 0.48, 640);
  const startX = width / 2 - spreadX / 2;

  return {
    x: startX + (column / 13) * spreadX + Math.sin(index * 1.7) * 8,
    y: height * 0.49 + (row - 1.5) * 19 + Math.cos(index * 1.3) * 7,
  };
}

function getParticleNodeOffset(index: number, radius: number) {
  const angle = index * 2.399963;
  const distance = radius * (0.2 + ((index * 17) % 70) / 100);
  return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
}

function buildAsciiMeter(score: number, length: number) {
  const filled = Math.round((clamp(score, 0, 100) / 100) * length);
  return `${'█'.repeat(filled)}${'░'.repeat(Math.max(0, length - filled))}`;
}

function getPulseDuration(growthRate: number) {
  const normalizedGrowth = clamp(Math.max(growthRate, 0), 0, 300) / 300;
  return Math.round(4200 - normalizedGrowth * 1900);
}

function hasSeenIntro() {
  try {
    return window.sessionStorage.getItem('community-pulse-intro') === 'seen';
  } catch {
    return true;
  }
}

function markIntroSeen() {
  try {
    window.sessionStorage.setItem('community-pulse-intro', 'seen');
  } catch {
    // Storage can be unavailable in private or embedded browsing contexts.
  }
}

function formatCount(value?: number) {
  return new Intl.NumberFormat('ko-KR').format(value ?? 0);
}

function formatGrowth(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

function truncateLabel(label: string, maximum: number) {
  return label.length > maximum ? `${label.slice(0, maximum - 1)}…` : label;
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

'use client';

import type { Timeline } from 'animejs';
import type { KeyboardEvent } from 'react';

import Link from 'next/link';
import { useRef, useMemo, useState, useEffect } from 'react';

import { useTheme } from '@mui/material/styles';
import { Skeleton, useMediaQuery } from '@mui/material';

import { CrossCommunityStory, CrossCommunityStage } from './cross-community-story';
import { formatActivityTime, formatActivityCount, formatActivityGrowth } from './activity-format';
import {
  type TopicLayout,
  calculateActivityLayout,
  getFallbackActivityLayout,
} from './activity-layout';
import {
  getStoryScene,
  activityMeter,
  STORY_DURATION,
  getCrossProgress,
  getStoryProgress,
  getParticleTopics,
  getRankingGeometry,
  getFeaturedGeometry,
  SCRUB_TIMELINE_OPTIONS,
} from './activity-motion';

import type { ActivityData, ActivityTopic } from './activity-data';
import type { CrossCommunityStageHandle } from './cross-community-story';

// Keep CSS modules after application imports (perfectionist/sort-imports).
// eslint-disable-next-line perfectionist/sort-imports
import styles from './activity-story.module.css';

type Props = {
  data?: ActivityData;
  isLoading: boolean;
  isError: boolean;
  isRefreshing?: boolean;
  onTopicSelect: (tag: string) => void;
};
type Dimensions = { width: number; height: number };
type NodeState = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  opacity: number;
  universe: number;
  ranking: number;
  featured: number;
  value: number;
};
const EMPTY_TOPICS: ActivityTopic[] = [];
const INTRO_KEY = 'community-pulse-intro-v3';

export function ActivityStory({ data, isLoading, isError, isRefreshing, onTopicSelect }: Props) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const staticLayout = useMediaQuery('(prefers-reduced-motion: reduce), (max-height: 700px)');
  const storyRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<CrossCommunityStageHandle>(null);
  const rankingRef = useRef<HTMLDetailsElement>(null);
  const introRef = useRef<(() => void) | null>(null);
  const [dimensions, setDimensions] = useState<Dimensions>({ width: 1280, height: 760 });
  const [geometry, setGeometry] = useState<{
    topics: ActivityTopic[];
    dimensions: Dimensions;
    layouts: TopicLayout[];
  } | null>(null);
  const [motionFailed, setMotionFailed] = useState(false);
  const [enhanced, setEnhanced] = useState(false);
  const topics = useMemo(
    () => data?.topics.slice(0, compact ? 10 : 16) ?? EMPTY_TOPICS,
    [data, compact]
  );
  const particles = useMemo(() => getParticleTopics(topics), [topics]);
  const universeTop = Math.max(160, dimensions.height * 0.2);
  const universeHeight = Math.max(1, dimensions.height - universeTop - 88);
  const fallback = useMemo(
    () =>
      getFallbackActivityLayout(topics, dimensions.width, universeHeight).map((layout) => ({
        ...layout,
        y: layout.y + universeTop,
      })),
    [topics, dimensions, universeHeight, universeTop]
  );
  const layouts =
    geometry?.topics === topics && geometry.dimensions === dimensions ? geometry.layouts : fallback;
  const rank = getRankingGeometry(dimensions.width, dimensions.height, compact);
  const animateStory = !staticLayout && !motionFailed && topics.length > 0;
  const updated = formatActivityTime(data?.generatedAt);
  const hours = data?.windowHours ?? 24;
  const allTopics = data?.topics ?? EMPTY_TOPICS;

  useEffect(() => {
    const stage = stageRef.current;
    const story = storyRef.current;
    if (!animateStory || !stage || !story || story.getBoundingClientRect().top < -20)
      return undefined;
    let disposed = false;
    const startIntro = async () => {
      try {
        if (sessionStorage.getItem(INTRO_KEY) === '1') return;
        const { animate, stagger } = await import('animejs');
        if (disposed || story.getBoundingClientRect().top < -20) return;
        sessionStorage.setItem(INTRO_KEY, '1');
        const intro = animate(stage.querySelectorAll('[data-intro]'), {
          opacity: [0, 1],
          y: [12, 0],
          duration: 620,
          delay: stagger(35),
          ease: 'out(3)',
        });
        introRef.current = () => intro.revert();
      } catch {
        // First-visit polish is optional when storage or motion is unavailable.
      }
    };
    startIntro().catch(() => undefined);
    return () => {
      disposed = true;
      introRef.current?.();
      introRef.current = null;
    };
  }, [animateStory]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !animateStory) {
      setEnhanced(false);
      return undefined;
    }
    let frame = 0;
    const measure = () => {
      frame = 0;
      const bounds = stage.getBoundingClientRect();
      if (bounds.width < 1 || bounds.height < 1) return;
      const next = { width: Math.round(bounds.width), height: Math.round(bounds.height) };
      setDimensions((current) =>
        current.width === next.width && current.height === next.height ? current : next
      );
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(stage);
    window.addEventListener('resize', schedule);
    measure();
    return () => {
      observer?.disconnect();
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [animateStory]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !animateStory) return undefined;
    let disposed = false;
    let controller: AbortController | null = null;
    let completed = false;
    const calculate = async () => {
      if (completed || controller || stage.getBoundingClientRect().width < 1) return;
      const request = new AbortController();
      controller = request;
      try {
        const result = await calculateActivityLayout(
          topics,
          data?.connections ?? [],
          dimensions.width,
          universeHeight,
          { signal: request.signal, compact }
        );
        result.simulation.stop();
        if (!disposed && !request.signal.aborted) {
          completed = true;
          setGeometry({
            topics,
            dimensions,
            layouts: result.layouts.map((layout) => ({
              ...layout,
              y: layout.y + universeTop,
            })),
          });
        }
      } catch {
        // Bounded deterministic geometry is already rendered if D3 is unavailable.
      } finally {
        if (controller === request) controller = null;
      }
    };
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              if (entry?.isIntersecting) calculate().catch(() => undefined);
              else {
                controller?.abort();
                controller = null;
              }
            },
            { rootMargin: '100px' }
          );
    observer?.observe(stage);
    if (!observer) calculate().catch(() => undefined);
    return () => {
      disposed = true;
      controller?.abort();
      observer?.disconnect();
    };
  }, [animateStory, topics, data?.connections, dimensions, compact, universeHeight, universeTop]);

  useEffect(() => {
    const story = storyRef.current;
    const stage = stageRef.current;
    if (!story || !stage || !animateStory || stage.getBoundingClientRect().width < 1)
      return undefined;
    let disposed = false;
    let frame = 0;
    let visible = true;
    let previousProgress = -1;
    let previousScene = '';
    let timeline: Timeline | undefined;
    const nodes = Array.from(stage.querySelectorAll<SVGGElement>('[data-topic-node]'));
    const cores = nodes.map((node) => node.querySelector<SVGRectElement>('[data-node-core]')!);
    const hitAreas = nodes.map((node) => node.querySelector<SVGRectElement>('[data-node-hit]')!);
    const universeGroups = nodes.map(
      (node) => node.querySelector<SVGGElement>('[data-universe-label]')!
    );
    const rankGroups = nodes.map((node) => node.querySelector<SVGGElement>('[data-rank-label]')!);
    const featuredGroups = nodes.map((node) =>
      node.querySelector<SVGGElement>('[data-featured-label]')
    );
    const scoreTexts = nodes.map(
      (node) => node.querySelector<SVGTextElement>('[data-rank-score]')!
    );
    const meterTexts = nodes.map(
      (node) => node.querySelector<SVGTextElement>('[data-rank-meter]')!
    );
    const points = Array.from(stage.querySelectorAll<SVGTextElement>('[data-particle]'));
    const connectors = Array.from(stage.querySelectorAll<SVGLineElement>('[data-topic-connector]'));
    const hero = stage.querySelector<HTMLElement>('[data-hero]')!;
    const heading = stage.querySelector<HTMLElement>('[data-scene-heading]')!;
    const universeHeading = stage.querySelector<HTMLElement>('[data-universe-heading]')!;
    const rankingHeading = stage.querySelector<HTMLElement>('[data-ranking-heading]')!;
    const rail = stage.querySelector<HTMLElement>('[data-scene-rail]')!;
    const title = stage.querySelector<HTMLElement>('[data-title]')!;
    const stageBounds = stage.getBoundingClientRect();
    const titleBounds = title.getBoundingClientRect();
    const titleArea = {
      x: titleBounds.left - stageBounds.left,
      y: titleBounds.top - stageBounds.top,
      width: titleBounds.width,
      height: titleBounds.height,
    };
    const targetById = new Map(layouts.map((layout) => [layout.id, layout]));
    const ranking = getRankingGeometry(dimensions.width, dimensions.height, compact);
    const featured = getFeaturedGeometry(dimensions.width, dimensions.height, compact);
    const rankLimit = compact ? 5 : 7;
    const crossLayer = stage.querySelector<HTMLElement>('[data-cross-stage]');
    const crossController = crossRef.current;
    const chrome = {
      hero: 1,
      spread: 0,
      clip: 0,
      heading: 0,
      universe: 1,
      ranking: 0,
      connection: 0,
      draw: 0,
      clock: 0,
    };
    const nodeStates: NodeState[] = topics.map((topic, index) => {
      const target = targetById.get(topic.id)!;
      return {
        x: titleArea.x + titleArea.width * (0.2 + (index % 5) * 0.14),
        y: titleArea.y + titleArea.height * (index % 2 ? 0.7 : 0.25),
        width: 4,
        height: 4,
        radius: 2,
        opacity: 0,
        universe: 0,
        ranking: 0,
        featured: 0,
        value: 0,
        // The real radius enters the timeline; no random geometry or copy nodes.
        ...(!target ? { opacity: 0 } : {}),
      };
    });
    const particleStates = particles.map((topic, index) => ({
      x: titleArea.x + titleArea.width * (0.05 + ((index % 14) / 14) * 0.9),
      y: titleArea.y + titleArea.height * (0.12 + Math.floor(index / 14) * 0.2),
      opacity: 0,
      topicId: topic.id,
    }));
    const interactive = new Map<SVGGElement, boolean>();

    const render = () => {
      frame = 0;
      if (!timeline || disposed || !visible) return;
      const bounds = story.getBoundingClientRect();
      const inset = Number.parseFloat(getComputedStyle(stage).top) || 0;
      const progress = getStoryProgress(bounds.top, story.offsetHeight, stage.offsetHeight, inset);
      if (Math.abs(progress - previousProgress) < 0.0001) return;
      previousProgress = progress;
      timeline.seek(progress * STORY_DURATION, true);
      crossRef.current?.seek(getCrossProgress(progress));
      crossLayer?.setAttribute('aria-hidden', String(progress < 0.744));
      if (progress > 0.025 && introRef.current) {
        introRef.current();
        introRef.current = null;
      }
      const scene = getStoryScene(progress);
      if (scene !== previousScene) {
        stage.dataset.scene = scene;
        previousScene = scene;
      }
      story.style.setProperty('--story-progress', String(progress));
      hero.style.opacity = String(chrome.hero);
      hero.style.pointerEvents = chrome.hero > 0.5 ? 'auto' : 'none';
      hero.inert = chrome.hero < 0.5;
      title.style.letterSpacing = `${-0.05 + chrome.spread * 0.18}em`;
      title.style.clipPath = `inset(0 0 ${chrome.clip * 100}% 0)`;
      heading.style.opacity = String(chrome.heading);
      universeHeading.style.opacity = String(chrome.universe);
      rankingHeading.style.opacity = String(chrome.ranking);
      rail.style.opacity = String(progress < 0.7 ? 1 : 0);
      rail.inert = progress >= 0.7;
      nodeStates.forEach((state, index) => {
        const node = nodes[index];
        node.setAttribute('transform', `translate(${state.x.toFixed(2)} ${state.y.toFixed(2)})`);
        node.style.opacity = String(state.opacity);
        const core = cores[index];
        core.setAttribute('x', String(-state.width / 2));
        core.setAttribute('y', String(-state.height / 2));
        core.setAttribute('width', String(state.width));
        core.setAttribute('height', String(state.height));
        core.setAttribute('rx', String(state.radius));
        const isRanking = state.ranking > 0.8;
        const hitWidth = isRanking
          ? dimensions.width - ranking.x * 2 + 22
          : Math.max(44, state.width);
        const hitHeight = isRanking ? Math.max(44, ranking.gap - 8) : Math.max(44, state.height);
        const hit = hitAreas[index];
        hit.setAttribute('x', String(isRanking ? -22 : -hitWidth / 2));
        hit.setAttribute('y', String(-hitHeight / 2));
        hit.setAttribute('width', String(hitWidth));
        hit.setAttribute('height', String(hitHeight));
        hit.setAttribute('rx', String(isRanking ? 8 : state.radius));
        universeGroups[index].style.opacity = String(state.universe);
        rankGroups[index].style.opacity = String(state.ranking);
        if (featuredGroups[index]) featuredGroups[index]!.style.opacity = String(state.featured);
        const score = Math.round(state.value);
        if (scoreTexts[index].textContent !== String(score))
          scoreTexts[index].textContent = String(score);
        const meter = activityMeter(state.value, ranking.meterLength);
        if (meterTexts[index].textContent !== meter) meterTexts[index].textContent = meter;
        const accessible =
          progress >= 0.25 &&
          (progress < 0.442 ||
            (progress < 0.68 && index < rankLimit) ||
            (progress >= 0.68 && index === 0));
        if (interactive.get(node) !== accessible) {
          node.setAttribute('tabindex', accessible ? '0' : '-1');
          node.setAttribute('aria-hidden', String(!accessible));
          node.style.pointerEvents = accessible ? 'auto' : 'none';
          interactive.set(node, accessible);
          if (!accessible && document.activeElement === node) stage.focus({ preventScroll: true });
        }
      });
      particleStates.forEach((point, index) => {
        points[index].setAttribute('x', point.x.toFixed(2));
        points[index].setAttribute('y', point.y.toFixed(2));
        points[index].style.opacity = String(point.opacity);
      });
      connectors.forEach((line) => {
        line.style.opacity = String(chrome.connection);
        line.setAttribute('stroke-dashoffset', String(1 - chrome.draw));
      });
    };
    const schedule = () => {
      if (!frame && visible) frame = requestAnimationFrame(render);
    };
    const setup = async () => {
      try {
        const { createTimeline } = await import('animejs');
        if (disposed) return;
        const next = createTimeline(SCRUB_TIMELINE_OPTIONS);
        next.add(chrome, { clock: [0, 1], duration: STORY_DURATION }, 0);
        next.add(chrome, { hero: [1, 0], spread: [0, 1], clip: [0, 0.8], duration: 135 }, 122);
        next.add(chrome, { heading: [0, 1], duration: 45 }, 228);
        next.add(chrome, { universe: [1, 0], ranking: [0, 1], duration: 45 }, 442);
        next.add(chrome, { heading: [1, 0], duration: 50 }, 680);
        next.add(chrome, { connection: [0, 0.5], draw: [0, 1], duration: 110 }, 248);
        next.add(chrome, { connection: [0.5, 0], duration: 45 }, 432);
        particleStates.forEach((point, index) => {
          const target = targetById.get(point.topicId)!;
          next.add(point, { opacity: [0, 0.75], duration: 40 }, 135 + (index % 7) * 2);
          next.add(
            point,
            { x: [point.x, target.x], y: [point.y, target.y], duration: 125 },
            155 + (index % 7) * 3
          );
          next.add(point, { opacity: [0.75, 0], duration: 35 }, 258 + (index % 7) * 2);
        });
        nodeStates.forEach((state, index) => {
          const target = targetById.get(topics[index].id)!;
          next.add(
            state,
            {
              x: [state.x, target.x],
              y: [state.y, target.y],
              width: [4, target.radius * 2],
              height: [4, target.radius * 2],
              radius: [2, target.radius],
              opacity: [0, 1],
              universe: [0, 1],
              duration: 95,
            },
            215 + index * 2
          );
          const position = 450 + Math.min(index, 6) * 5;
          next.add(
            state,
            index < rankLimit
              ? {
                  x: [target.x, ranking.x],
                  y: [target.y, ranking.y + index * ranking.gap],
                  width: [target.radius * 2, 14],
                  height: [target.radius * 2, 14],
                  radius: [target.radius, 7],
                  universe: [1, 0],
                  ranking: [0, 1],
                  value: [0, topics[index].activityScore],
                  duration: 145,
                }
              : {
                  opacity: [1, 0],
                  width: [target.radius * 2, 4],
                  height: [target.radius * 2, 4],
                  universe: [1, 0],
                  duration: 110,
                },
            position
          );
          if (index === 0) {
            next.add(
              state,
              {
                x: [ranking.x, featured.x],
                y: [ranking.y, featured.y],
                ranking: [1, 0],
                duration: 64,
              },
              680
            );
            next.add(
              state,
              {
                width: [14, featured.width],
                height: [14, featured.height],
                radius: [7, 24],
                featured: [0, 1],
                duration: 80,
              },
              744
            );
          } else if (index < rankLimit) {
            next.add(
              state,
              {
                y: [ranking.y + index * ranking.gap, dimensions.height + 40],
                opacity: [1, 0],
                ranking: [1, 0],
                duration: 70,
              },
              682 + index * 3
            );
          }
        });
        timeline = next;
        setEnhanced(true);
        schedule();
      } catch {
        if (!disposed) {
          setMotionFailed(true);
          setEnhanced(false);
        }
      }
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer =
      typeof IntersectionObserver === 'undefined'
        ? null
        : new IntersectionObserver(
            ([entry]) => {
              visible = Boolean(entry?.isIntersecting);
              if (visible) {
                previousProgress = -1;
                schedule();
              }
            },
            { rootMargin: '100px' }
          );
    observer?.observe(story);
    setup().catch(() => undefined);
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      timeline?.revert();
      crossController?.seek(0);
      // The timeline animates plain objects; restore the DOM mutations for static fallback.
      hero.style.removeProperty('opacity');
      hero.style.removeProperty('pointer-events');
      hero.inert = false;
      title.style.removeProperty('letter-spacing');
      title.style.removeProperty('clip-path');
      rail.style.removeProperty('opacity');
      rail.inert = false;
      heading.style.removeProperty('opacity');
      universeHeading.style.removeProperty('opacity');
      rankingHeading.style.removeProperty('opacity');
      stage.dataset.scene = 'hero';
      story.style.removeProperty('--story-progress');
    };
  }, [animateStory, topics, particles, layouts, dimensions, compact]);

  const openRanking = () => {
    if (rankingRef.current) rankingRef.current.open = true;
  };
  const selectWithKeyboard = (event: KeyboardEvent<SVGGElement>, topic: ActivityTopic) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onTopicSelect(topic.label);
    }
  };
  const layoutById = new Map(layouts.map((layout) => [layout.id, layout]));
  return (
    <div className={styles.experience}>
      <section
        ref={storyRef}
        id="community-pulse"
        className={styles.story}
        data-community-story
        data-enhanced={enhanced && animateStory}
        aria-labelledby="pulse-title"
      >
        {enhanced && animateStory && (
          <span id="cross-community" className={styles.crossAnchor} aria-hidden="true" />
        )}
        <div ref={stageRef} className={styles.stage} data-scene="hero" tabIndex={-1}>
          <div className={styles.stageGrid} aria-hidden="true" />
          <header className={styles.hero} data-hero>
            <div className={styles.heroTopline} data-intro>
              <span>COMMUNITY PULSE</span>
              <span className={styles.live}>
                최근 {hours}시간 <i aria-hidden="true" />
              </span>
            </div>
            <div className={styles.heroCopy}>
              <p className={styles.kicker} data-intro>
                여러 커뮤니티의 이야기가 모이는 곳
              </p>
              <h1 id="pulse-title" data-title data-intro>
                최근 {hours}시간
                <br />
                커뮤니티 동향
              </h1>
              <p className={styles.description} data-intro>
                수집한 게시글의 AI 태그를 기준으로
                <br />
                언급량과 증감, 출처의 흐름을 살펴봅니다.
              </p>
              <p className={styles.updated} data-intro>
                {updated ? (
                  <time dateTime={data?.generatedAt}>{updated} 갱신</time>
                ) : isLoading ? (
                  '최근 집계를 불러오는 중'
                ) : (
                  '집계 시각 없음'
                )}
              </p>
            </div>
            <dl className={styles.metrics} aria-label="최근 커뮤니티 집계">
              {[
                { label: '분석 게시글', english: 'ANALYZED POSTS', value: data?.analyzedPostCount },
                { label: 'AI 태그', english: 'UNIQUE AI TAGS', value: data?.uniqueTagCount },
                { label: '확인된 연결', english: 'KNOWN LINKS', value: data?.knownEdgeCount },
                { label: '표시 출처', english: 'VISIBLE SOURCES', value: data?.sourceCount },
              ].map((metric, index) => (
                <div key={metric.label} className={styles.metric} data-metric={index} data-intro>
                  <dt>
                    {metric.label}
                    <span>{metric.english}</span>
                  </dt>
                  <dd>
                    {metric.value !== undefined ? (
                      formatActivityCount(metric.value)
                    ) : isLoading ? (
                      <Skeleton width={90} />
                    ) : (
                      '—'
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <div className={styles.heroBottom}>
              <Link href="#popular-feed" className={styles.skipLink}>
                인기글 바로 보기 <span aria-hidden="true">↓</span>
              </Link>
              <Link href="#all-topic-rankings" onClick={openRanking} className={styles.textLink}>
                표시 태그 순위 모두 보기
              </Link>
              <span className={styles.scrollHint} aria-hidden="true">
                SCROLL TO EXPLORE ↓
              </span>
            </div>
          </header>
          {animateStory && (
            <>
              <div className={styles.sceneHeading} data-scene-heading aria-hidden="true">
                <div data-universe-heading>
                  <p>TOPIC UNIVERSE</p>
                  <h2>태그가 만드는 지금의 풍경</h2>
                  <span>크기 · 게시글 수 / 선 · 관련 태그 / 중심 거리 · 상대 Activity</span>
                </div>
                <div data-ranking-heading>
                  <p>TRENDING NOW / 최근 {hours}시간</p>
                  <h2>지금 활발한 이야기</h2>
                  <span>
                    Activity는 현재 응답 안의 상대 지표 · 증감은 최근/이전 12시간 보정 비교
                  </span>
                </div>
              </div>
              <svg
                className={styles.topicSvg}
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                aria-label="AI 태그가 활동 순위와 출처 카드로 이어지는 시각화"
              >
                <g aria-hidden="true">
                  {data?.connections.map((connection) => {
                    const source = layoutById.get(connection.sourceId);
                    const target = layoutById.get(connection.targetId);
                    if (!source || !target) return null;
                    return (
                      <line
                        key={connection.id}
                        data-topic-connector
                        className={styles.connector}
                        pathLength={1}
                        strokeDasharray={1}
                        x1={source.x}
                        y1={source.y}
                        x2={target.x}
                        y2={target.y}
                      />
                    );
                  })}
                  {particles.map((topic, index) => (
                    <text
                      key={index}
                      data-particle
                      data-particle-topic={topic.id}
                      className={styles.particle}
                    >
                      {['·', '•', '●', '◉'][Math.min(3, Math.floor(topic.activityScore / 26))]}
                    </text>
                  ))}
                </g>
                {topics.map((topic, index) => {
                  const layout = layoutById.get(topic.id)!;
                  const labelLimit = Math.min(
                    12,
                    Math.max(2, Math.floor((rank.meterX - 40) / (compact ? 16 : 23)) - 1)
                  );
                  const bubbleLimit = Math.max(
                    2,
                    Math.floor((layout.radius * 2 - 24) / (compact ? 12 : 16))
                  );
                  const bubbleLabel =
                    topic.label.length > bubbleLimit
                      ? `${topic.label.slice(0, bubbleLimit)}…`
                      : topic.label;
                  const shortLabel =
                    topic.label.length > labelLimit
                      ? `${topic.label.slice(0, labelLimit)}…`
                      : topic.label;
                  return (
                    <g
                      key={topic.id}
                      data-topic-node={topic.id}
                      data-rank={index + 1}
                      className={styles.topicNode}
                      tabIndex={-1}
                      role="button"
                      aria-hidden="true"
                      aria-label={`${topic.label} 태그 게시글 ${
                        topic.volume
                      }개, Activity ${Math.round(topic.activityScore)}, 증감 ${formatActivityGrowth(
                        topic.growthRate
                      )} 보기`}
                      onClick={() => onTopicSelect(topic.label)}
                      onKeyDown={(event) => selectWithKeyboard(event, topic)}
                    >
                      <title>
                        {`${topic.label} · ${formatActivityCount(topic.volume)}개 · 표시 출처 ${
                          topic.sourceCount
                        }곳`}
                      </title>
                      <rect
                        data-node-hit
                        fill="transparent"
                        x={-22}
                        y={-22}
                        width={44}
                        height={44}
                      />
                      <rect
                        data-node-core
                        className={styles.nodeCore}
                        x={-layout.radius}
                        y={-layout.radius}
                        width={layout.radius * 2}
                        height={layout.radius * 2}
                        rx={layout.radius}
                      />
                      <g data-universe-label className={styles.universeLabel}>
                        <circle
                          r={layout.radius + 6}
                          pathLength={100}
                          strokeDasharray={`${Math.min(100, Math.abs(topic.growthRate) / 3)} 100`}
                          className={styles.growthRing}
                        />
                        <text textAnchor="middle" y={-5} className={styles.nodeName}>
                          {bubbleLabel}
                        </text>
                        <text textAnchor="middle" y={17} className={styles.nodeCount}>
                          {formatActivityCount(topic.volume)}개
                        </text>
                        <text
                          textAnchor="middle"
                          y={35}
                          opacity={layout.radius >= 56 ? 1 : 0}
                          className={styles.nodeSources}
                        >
                          {topic.sourceCount} SOURCES · {formatActivityGrowth(topic.growthRate)}
                        </text>
                      </g>
                      <g data-rank-label className={styles.rankLabel}>
                        <text x={-22} y={5} textAnchor="middle" className={styles.rankNumber}>
                          {String(index + 1).padStart(2, '0')}
                        </text>
                        <text x={23} y={5} className={styles.rankTag}>
                          {shortLabel}
                        </text>
                        <text x={23} y={25} className={styles.rankMeta}>
                          {formatActivityCount(topic.volume)}개 · 출처 {topic.sourceCount}곳
                        </text>
                        <text x={rank.meterX} y={5} data-rank-meter className={styles.rankMeter}>
                          {activityMeter(topic.activityScore, rank.meterLength)}
                        </text>
                        <text x={rank.scoreX} y={5} data-rank-score className={styles.rankScore}>
                          {Math.round(topic.activityScore)}
                        </text>
                        <text x={rank.growthX} y={5} className={styles.rankGrowth}>
                          {formatActivityGrowth(topic.growthRate)}
                        </text>
                      </g>
                      {index === 0 && (
                        <g data-featured-label className={styles.featuredLabel}>
                          <text
                            y={compact ? -47 : -66}
                            textAnchor="middle"
                            className={styles.featuredEyebrow}
                          >
                            TRENDING #1
                          </text>
                          <text
                            y={compact ? -10 : -18}
                            textAnchor="middle"
                            className={styles.featuredName}
                          >
                            {topic.label.length > 8 ? `${topic.label.slice(0, 8)}…` : topic.label}
                          </text>
                          <text
                            y={compact ? 22 : 20}
                            textAnchor="middle"
                            className={styles.featuredScore}
                          >
                            ACTIVITY {Math.round(topic.activityScore)} ·{' '}
                            {formatActivityGrowth(topic.growthRate)}
                          </text>
                          <text
                            y={compact ? 49 : 62}
                            textAnchor="middle"
                            className={styles.featuredMeta}
                          >
                            {formatActivityCount(topic.volume)}개 게시글 · {topic.sourceCount}개
                            출처
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
              <CrossCommunityStage
                ref={crossRef}
                topic={topics[0]}
                windowHours={hours}
                generatedAt={data?.generatedAt}
              />
              <div className={styles.sceneRail} data-scene-rail>
                <span>TYPE</span>
                <span>PARTICLE</span>
                <span>UNIVERSE</span>
                <span>RANK</span>
                <Link href="#all-topic-rankings" onClick={openRanking}>
                  표시 태그 모두 보기 ↗
                </Link>
                <div className={styles.progressTrack}>
                  <i />
                </div>
              </div>
            </>
          )}
          {(isError || isRefreshing) && (
            <p className={styles.status} role="status">
              {isError
                ? data
                  ? '갱신에 실패해 마지막 집계 데이터를 표시합니다.'
                  : '동향을 불러오지 못했습니다. 아래 인기글은 계속 확인할 수 있습니다.'
                : '최근 동향을 갱신하고 있습니다.'}
            </p>
          )}
        </div>
      </section>
      <details
        ref={rankingRef}
        id="all-topic-rankings"
        className={styles.fullRanking}
        open={!(enhanced && animateStory)}
      >
        <summary>
          최근 {hours}시간 표시 태그 순위 <span>상위 {allTopics.length}개 태그</span>
        </summary>
        <p className={styles.scoreNote}>
          집계된 상위 {allTopics.length}개 태그를 표시합니다. Activity는 언급량·증감·표시
          출처·확인된 연결을 현재 응답 안에서 비교한 상대 지표입니다. 증감은 최근 12시간과 이전
          12시간 게시글 수의 +1 보정 비교입니다.
        </p>
        <ol className={styles.semanticList} aria-label="최근 AI 태그 활동 순위">
          {allTopics.map((topic) => (
            <li key={topic.id}>
              <button
                type="button"
                data-static-topic={topic.id}
                onClick={() => onTopicSelect(topic.label)}
              >
                <span>{String(topic.rank).padStart(2, '0')}</span>
                <strong>#{topic.label}</strong>
                <span>{formatActivityCount(topic.volume)}개</span>
                <span>Activity {Math.round(topic.activityScore)}</span>
                <span>{formatActivityGrowth(topic.growthRate)}</span>
              </button>
            </li>
          ))}
        </ol>
        {!allTopics.length && (
          <p role="status">
            {isLoading
              ? '태그 통계를 불러오는 중입니다.'
              : isError
                ? '태그 통계를 불러오지 못했습니다.'
                : '최근 집계에 AI 태그가 없습니다.'}{' '}
            <Link href="/board">게시판 보기</Link>
          </p>
        )}
      </details>
      {!(enhanced && animateStory) && (
        <CrossCommunityStory
          topic={isLoading ? undefined : (data?.topics[0] ?? null)}
          windowHours={hours}
          generatedAt={data?.generatedAt}
          isError={isError}
        />
      )}
    </div>
  );
}

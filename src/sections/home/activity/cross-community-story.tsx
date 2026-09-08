'use client';

import type { Timeline } from 'animejs';
import type { CSSProperties } from 'react';

import Link from 'next/link';
import { useRef, useMemo, useState, useEffect, forwardRef, useImperativeHandle } from 'react';

import EastRoundedIcon from '@mui/icons-material/EastRounded';

import { formatActivityTime, formatActivityCount, formatActivityGrowth } from './activity-format';

import type { ActivityTopic, ActivitySource } from './activity-data';

// Keep CSS modules after application imports (perfectionist/sort-imports).
// eslint-disable-next-line perfectionist/sort-imports
import styles from './cross-community-story.module.css';

const MAX_SOURCE_CARDS = 6;
const METER_LENGTH = 12;
const TIMELINE_DURATION = 1000;
const INTERACTIVE_PROGRESS = 0.75;

type Props = {
  topic?: ActivityTopic | null;
  windowHours?: number;
  generatedAt?: string;
  isError?: boolean;
  id?: string;
};

export type CrossCommunityStageHandle = {
  seek: (progress: number) => void;
};

type StageProps = Omit<Props, 'isError' | 'id'> & {
  static?: boolean;
};

type StageDimensions = { width: number; height: number };
type CardLayout = { x: number; y: number; width: number; height: number };

/** The featured topic stays in ActivityStory's persistent SVG layer. */
export const CrossCommunityStage = forwardRef<CrossCommunityStageHandle, StageProps>(
  ({ topic, windowHours = 24, generatedAt, static: staticLayout = false }, ref) => {
    const stageRef = useRef<HTMLDivElement>(null);
    const latestProgress = useRef(0);
    const renderProgress = useRef<((progress: number) => void) | null>(null);
    const [dimensions, setDimensions] = useState<StageDimensions>({ width: 1280, height: 760 });
    const sources = useMemo(() => topic?.sources.slice(0, MAX_SOURCE_CARDS) ?? [], [topic]);
    const compact = dimensions.width < 900;
    const hasTopic = Boolean(topic);
    const layouts = useMemo(() => getCardLayouts(sources, dimensions), [sources, dimensions]);

    useImperativeHandle(
      ref,
      () => ({
        seek(progress) {
          latestProgress.current = clamp(progress);
          renderProgress.current?.(latestProgress.current);
        },
      }),
      []
    );

    useEffect(() => {
      const stage = stageRef.current;
      if (!stage) return undefined;
      let frame = 0;
      const measure = () => {
        frame = 0;
        const bounds = stage.getBoundingClientRect();
        if (bounds.width <= 0 || bounds.height <= 0) return;
        const next = { width: Math.round(bounds.width), height: Math.round(bounds.height) };
        setDimensions((current) =>
          current.width === next.width && current.height === next.height ? current : next
        );
      };
      const schedule = () => {
        if (!frame) frame = window.requestAnimationFrame(measure);
      };
      const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
      observer?.observe(stage);
      window.addEventListener('resize', schedule);
      measure();
      return () => {
        observer?.disconnect();
        window.removeEventListener('resize', schedule);
        if (frame) window.cancelAnimationFrame(frame);
      };
    }, [hasTopic]);

    useEffect(() => {
      const stage = stageRef.current;
      if (!stage || !topic) return undefined;
      let disposed = false;
      let timeline: Timeline | null = null;
      let loading = false;
      const list = stage.querySelector<HTMLOListElement>('[data-source-list]');
      const slots = Array.from(stage.querySelectorAll<HTMLElement>('[data-source-slot]'));
      const contents = Array.from(stage.querySelectorAll<HTMLElement>('[data-source-content]'));
      const links = Array.from(stage.querySelectorAll<HTMLAnchorElement>('[data-source-link]'));
      const counters = Array.from(stage.querySelectorAll<HTMLElement>('[data-source-count]'));
      const meters = Array.from(stage.querySelectorAll<HTMLElement>('[data-source-meter]'));
      const connectors = Array.from(
        stage.querySelectorAll<SVGPathElement>('[data-source-connector]')
      );
      const heading = stage.querySelector<HTMLElement>('[data-cross-heading]');
      const note = stage.querySelector<HTMLElement>('[data-cross-note]');
      const origin = getFeaturedOrigin(dimensions);
      let lastAccessible: boolean | undefined;

      const setAccessibility = (accessible: boolean) => {
        if (lastAccessible === accessible) return;
        lastAccessible = accessible;
        list?.setAttribute('aria-hidden', String(!accessible));
        list?.toggleAttribute('inert', !accessible);
        links.forEach((link) => {
          link.tabIndex = accessible ? 0 : -1;
          if (!accessible && document.activeElement === link) link.blur();
        });
      };

      // A deterministic fallback covers delayed or failed animation imports.
      const renderWithoutTimeline = (progress: number) => {
        if (heading) heading.style.opacity = String(clamp((progress - 0.2) / 0.15));
        if (note) note.style.opacity = String(clamp((progress - 0.82) / 0.12));
        slots.forEach((slot, index) => {
          const layout = layouts[index];
          const split = ease(clamp((progress - 0.45 - index * 0.018) / 0.28));
          slot.style.transform = `translate(${(origin.x - layout.x) * (1 - split)}px, ${(origin.y - layout.y) * (1 - split)}px) scale(${1 + (origin.width / layout.width - 1) * (1 - split)}, ${1 + (origin.height / layout.height - 1) * (1 - split)})`;
          slot.style.opacity = String(clamp((progress - 0.45 - index * 0.018) / 0.07));
          slot.style.clipPath = getFragmentClip(index, slots.length, split);
          contents[index].style.opacity = String(clamp((progress - 0.61 - index * 0.018) / 0.14));
          const connectorProgress = clamp((progress - 0.77 - index * 0.015) / 0.13);
          connectors[index]?.setAttribute('stroke-dashoffset', String(1 - connectorProgress));
          if (connectors[index]) connectors[index].style.opacity = String(connectorProgress);
        });
      };

      const render = (requested: number) => {
        const progress = staticLayout ? 1 : requested;
        if (timeline) timeline.seek(progress * TIMELINE_DURATION, true);
        else renderWithoutTimeline(progress);
        setAccessibility(staticLayout || progress >= INTERACTIVE_PROGRESS);
        counters.forEach((counter, index) => {
          const countProgress = ease(clamp((progress - 0.61 - index * 0.018) / 0.16));
          const value = formatActivityCount(
            Math.round(sources[index].contribution * countProgress)
          );
          if (counter.textContent !== value) counter.textContent = value;
          const meter = buildMeter(sources[index].contributionRatio * countProgress);
          if (meters[index].textContent !== meter) meters[index].textContent = meter;
        });
        if (!staticLayout && !loading && progress > 0) loadTimeline().catch(() => undefined);
      };

      const loadTimeline = async () => {
        loading = true;
        try {
          const { createTimeline } = await import('animejs');
          if (disposed) return;
          const next = createTimeline({
            autoplay: false,
            defaults: { ease: 'linear', composition: 'none' },
          });
          if (heading) next.add(heading, { opacity: [0, 1], duration: 150 }, 200);
          if (note) next.add(note, { opacity: [0, 1], duration: 120 }, 820);
          slots.forEach((slot, index) => {
            const layout = layouts[index];
            next.add(
              slot,
              {
                translateX: [origin.x - layout.x, 0],
                translateY: [origin.y - layout.y, 0],
                scaleX: [origin.width / layout.width, 1],
                scaleY: [origin.height / layout.height, 1],
                clipPath: [
                  getFragmentClip(index, slots.length, 0),
                  getFragmentClip(index, slots.length, 1),
                ],
                ease: 'inOut(3)',
                duration: 280,
              },
              450 + index * 18
            );
            next.add(slot, { opacity: [0, 1], duration: 70 }, 450 + index * 18);
            next.add(contents[index], { opacity: [0, 1], duration: 140 }, 610 + index * 18);
            if (connectors[index])
              next.add(
                connectors[index],
                {
                  opacity: [0, 1],
                  strokeDashoffset: [1, 0],
                  duration: 130,
                },
                770 + index * 15
              );
          });
          timeline = next;
          stage.dataset.motion = 'ready';
          render(latestProgress.current);
        } catch {
          if (!disposed) stage.dataset.motion = 'fallback';
        }
      };

      renderProgress.current = render;
      render(latestProgress.current);
      return () => {
        disposed = true;
        renderProgress.current = null;
        timeline?.revert();
      };
    }, [dimensions, layouts, sources, staticLayout, topic]);

    if (!topic) return null;
    const origin = getFeaturedOrigin(dimensions);
    return (
      <div
        ref={stageRef}
        className={styles.stage}
        data-cross-stage
        data-compact={compact || undefined}
        data-dense={layouts.some((layout) => layout.height < 195) || undefined}
        data-tight={layouts.some((layout) => layout.height < 130) || undefined}
      >
        <header className={styles.stageHeading} data-cross-heading>
          <div>
            <p className={styles.eyebrow}>CROSS COMMUNITY</p>
            <h2>같은 태그, 서로 다른 커뮤니티</h2>
          </div>
          <TimeNote hours={windowHours} generatedAt={generatedAt} />
        </header>
        <svg
          className={styles.connectors}
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
          aria-hidden="true"
        >
          {sources.map((source, index) => {
            const layout = layouts[index];
            return (
              <path
                key={source.id}
                data-source-connector
                pathLength={1}
                strokeDasharray={1}
                d={`M ${origin.x} ${origin.y} L ${layout.x} ${origin.y} L ${layout.x} ${layout.y}`}
              />
            );
          })}
        </svg>
        <ol
          className={styles.stageSources}
          data-source-list
          aria-label={`${topic.label} 태그의 커뮤니티별 분포`}
          aria-hidden={!staticLayout}
          inert={!staticLayout}
        >
          {sources.map((source, index) => {
            const layout = layouts[index];
            const style: CSSProperties = {
              left: layout.x - layout.width / 2,
              top: layout.y - layout.height / 2,
              width: layout.width,
              height: layout.height,
            };
            return (
              <li key={source.id} className={styles.sourceSlot} style={style} data-source-slot>
                <SourceCard
                  source={source}
                  tag={topic.label}
                  index={index}
                  animated
                  tabIndex={staticLayout ? 0 : -1}
                />
              </li>
            );
          })}
        </ol>
        <p className={styles.stageNote} data-cross-note>
          {sources.length
            ? '카드 크기와 막대는 이 태그 게시글의 출처별 비중입니다. 연결선은 태그와 출처의 관계를 나타냅니다.'
            : '최근 집계에 출처별 통계가 없습니다.'}
        </p>
      </div>
    );
  }
);

/** Ordinary document flow is the accessible, reduced-motion and error fallback. */
export function CrossCommunityStory({
  topic,
  windowHours = 24,
  generatedAt,
  isError,
  id = 'cross-community',
}: Props) {
  if (!topic || !topic.sources.length)
    return (
      <section id={id} className={styles.story} aria-labelledby={`${id}-title`}>
        <div className={styles.empty} role="status">
          <p className={styles.eyebrow}>CROSS COMMUNITY</p>
          <h2 id={`${id}-title`}>커뮤니티별 게시글 분포</h2>
          <p>
            {isError
              ? '출처별 통계를 불러오지 못했습니다.'
              : topic === undefined
                ? '출처별 통계를 불러오는 중입니다.'
                : '최근 집계에 출처별 통계가 없습니다.'}
          </p>
          <Link href="/board">
            전체 게시판 보기 <EastRoundedIcon fontSize="small" />
          </Link>
        </div>
      </section>
    );
  const sources = topic.sources.slice(0, MAX_SOURCE_CARDS);
  return (
    <section id={id} className={styles.story} aria-labelledby={`${id}-title`}>
      <div className={styles.distribution}>
        <div className={styles.intro}>
          <p className={styles.eyebrow}>CROSS COMMUNITY</p>
          <h2 id={`${id}-title`}>
            #{topic.label}
            <br />
            출처별 게시글 분포
          </h2>
          <TimeNote hours={windowHours} generatedAt={generatedAt} />
          <article className={styles.topicCard} aria-label={`${topic.rank}위 태그 ${topic.label}`}>
            <div className={styles.topicTopline}>
              <span>태그 순위 {topic.rank}위</span>
              <span>
                Activity <strong>{Math.round(topic.activityScore)}</strong>
              </span>
            </div>
            <h3>#{topic.label}</h3>
            <p className={styles.topicVolume}>
              {formatActivityCount(topic.volume)}
              <span>개 게시글</span>
            </p>
            <div className={styles.topicMeta}>
              <span>표시 출처 {topic.sourceCount}곳</span>
              <span>최근 구간 {formatActivityGrowth(topic.growthRate)}</span>
            </div>
          </article>
          <p className={styles.scopeNote}>
            비중은 이 태그가 포함된 전체 게시글 수를 기준으로 계산합니다. 집계에 포함된 출처를 최대
            6곳 표시합니다. Activity는 현재 응답 안의 상대 점수입니다.
          </p>
          {isError && (
            <p className={styles.error} role="status">
              출처별 통계 갱신에 실패해 마지막 집계 데이터를 표시합니다.
            </p>
          )}
        </div>
        <ol className={styles.sourceList} aria-label={`${topic.label} 태그의 커뮤니티별 분포`}>
          {sources.map((source, index) => (
            <li key={source.id}>
              <SourceCard source={source} tag={topic.label} index={index} />
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function SourceCard({
  source,
  tag,
  index,
  animated = false,
  tabIndex,
}: {
  source: ActivitySource;
  tag: string;
  index: number;
  animated?: boolean;
  tabIndex?: number;
}) {
  const share = clamp(source.contributionRatio);
  const name = source.name.trim() || source.site;
  return (
    <Link
      href={createSourceHref(tag, source.site)}
      className={styles.sourceCard}
      tabIndex={tabIndex}
      data-source-link
      aria-label={`${name}에서 ${tag} 태그 게시글 ${formatActivityCount(source.contribution)}개 보기, 비중 ${Math.round(share * 100)}%`}
    >
      <div className={styles.sourceContent} data-source-content>
        <div className={styles.sourceTopline}>
          <span>{String(index + 1).padStart(2, '0')}</span>
          <span>{Math.round(share * 100)}%</span>
        </div>
        <h3>{name}</h3>
        <p className={styles.sourceValues}>
          <strong data-source-count={animated || undefined} aria-hidden={animated || undefined}>
            {formatActivityCount(source.contribution)}
          </strong>
          <span>관련 게시글</span>
        </p>
        <div className={styles.asciiMeter} aria-hidden="true">
          <span data-source-meter={animated || undefined}>{buildMeter(share)}</span>
          <small>SHARE</small>
        </div>
        <p className={styles.representativePost}>
          {source.representativePost ? source.representativePost.title : '연결된 Top 10 글 없음'}
        </p>
        <span className={styles.cardAction} aria-hidden="true">
          이 출처에서 보기 <EastRoundedIcon fontSize="small" />
        </span>
      </div>
    </Link>
  );
}

function TimeNote({ hours, generatedAt }: { hours: number; generatedAt?: string }) {
  const updated = formatActivityTime(generatedAt);
  return (
    <p className={styles.timeNote}>
      최근 {hours}시간{updated && <time dateTime={generatedAt}> · {updated} 갱신</time>}
    </p>
  );
}

function getFeaturedOrigin({ width, height }: StageDimensions) {
  const compact = width < 900;
  return {
    x: width / 2,
    y: height * (compact ? 0.27 : 0.52),
    width: compact ? Math.min(286, width - 40) : 360,
    height: compact ? 160 : 200,
  };
}

function getCardLayouts(
  sources: ActivitySource[],
  { width, height }: StageDimensions
): CardLayout[] {
  if (width < 900) {
    const gutter = width < 600 ? 20 : 24;
    const columnWidth = (width - gutter * 2 - 12) / 2;
    const rows = Math.ceil(sources.length / 2);
    const top = height * 0.27 + 98;
    const rowHeight = Math.min(
      172,
      Math.max(100, (height - 32 - top - Math.max(0, rows - 1) * 12) / Math.max(rows, 1))
    );
    return sources.map((source, index) => {
      const scale = Math.sqrt(clamp(source.contributionRatio));
      return {
        x:
          index === sources.length - 1 && sources.length % 2
            ? width / 2
            : gutter + columnWidth / 2 + (index % 2) * (columnWidth + 12),
        y: top + Math.floor(index / 2) * (rowHeight + 12) + rowHeight / 2,
        width: Math.min(320, columnWidth) * (0.92 + scale * 0.08),
        height: rowHeight * (0.94 + scale * 0.06),
      };
    });
  }
  const innerWidth = Math.min(width - 96, 1536);
  const top = height < 740 ? 96 : 124;
  const rowHeight = Math.max(108, Math.min(182, height * 0.52 - 120 - top));
  return sources.map((source, index) => {
    const scale = Math.sqrt(clamp(source.contributionRatio));
    const upper = index < 2 || index === 4;
    return {
      x: index < 4 ? width / 2 + (index % 2 ? 1 : -1) * innerWidth * 0.34 : width / 2,
      y: upper ? top + rowHeight / 2 : height - 44 - rowHeight / 2,
      width: Math.min(344, innerWidth * 0.27) * (0.86 + scale * 0.14),
      height: rowHeight * (0.9 + scale * 0.1),
    };
  });
}

function getFragmentClip(index: number, count: number, progress: number) {
  const rows = Math.max(1, Math.ceil(count / 2));
  const row = Math.floor(index / 2);
  const remaining = 1 - progress;
  const lastUnpaired = count % 2 === 1 && index === count - 1;
  return `inset(${(row / rows) * 100 * remaining}% ${(lastUnpaired || index % 2 ? 0 : 50) * remaining}% ${(1 - (row + 1) / rows) * 100 * remaining}% ${(!lastUnpaired && index % 2 ? 50 : 0) * remaining}% round 24px)`;
}

function createSourceHref(tag: string, site: string) {
  return `/board?${new URLSearchParams({ tag, sites: site }).toString()}`;
}

function buildMeter(value: number) {
  const filled = Math.round(clamp(value) * METER_LENGTH);
  return `${'█'.repeat(filled)}${'░'.repeat(METER_LENGTH - filled)}`;
}

function clamp(value: number) {
  return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0;
}

function ease(value: number) {
  return value * value * (3 - 2 * value);
}

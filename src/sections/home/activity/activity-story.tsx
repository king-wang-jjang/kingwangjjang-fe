'use client';

import type { KeyboardEvent } from 'react';

import Link from 'next/link';
import { useRef, useMemo, useState, useEffect } from 'react';

import { useTheme } from '@mui/material/styles';
import { Skeleton, useMediaQuery } from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import SouthRoundedIcon from '@mui/icons-material/SouthRounded';

// Keep CSS modules after external imports (import/order).
// eslint-disable-next-line perfectionist/sort-imports
import styles from './activity-story.module.css';

import { type TopicLayout, calculateActivityLayout } from './activity-layout';

import type { ActivityData, ActivityTopic } from './activity-data';

type Props = {
  data?: ActivityData;
  isLoading: boolean;
  isError: boolean;
  isRefreshing?: boolean;
  onTopicSelect: (tag: string) => void;
};

const EMPTY_TOPICS: ActivityTopic[] = [];

export function ActivityStory({ data, isLoading, isError, isRefreshing, onTopicSelect }: Props) {
  const theme = useTheme();
  const compact = useMediaQuery(theme.breakpoints.down('md'));
  const staticLayout = useMediaQuery('(prefers-reduced-motion: reduce), (max-height: 700px)');
  const topics = useMemo(
    () => data?.topics.slice(0, compact ? 10 : 16) ?? EMPTY_TOPICS,
    [data, compact]
  );
  const ranking = topics.slice(0, compact ? 5 : 7);
  const hours = data?.windowHours ?? 24;
  const updated = formatActivityTime(data?.generatedAt);
  const metrics = [
    { label: '분석 게시글', value: data?.analyzedPostCount, unit: '개' },
    { label: 'AI 태그', value: data?.uniqueTagCount, unit: '개' },
    { label: '태그 연결', value: data?.knownEdgeCount, unit: '개' },
    { label: '표시 출처', value: data?.sourceCount, unit: '곳' },
  ];

  return (
    <section
      id="community-pulse"
      className={styles.story}
      aria-labelledby="pulse-title"
      aria-busy={isLoading || isRefreshing}
    >
      <div className={styles.report}>
        <header className={styles.hero}>
          <p className={styles.sectionLabel}>
            <span>01</span> 커뮤니티 동향
          </p>
          <div className={styles.timeNote}>
            <span className={styles.period}>최근 {hours}시간</span>
            <span>
              {updated ? (
                <time dateTime={data?.generatedAt}>{updated} 갱신</time>
              ) : (
                '집계 시각 확인 중'
              )}
            </span>
          </div>
          <h1 id="pulse-title">
            최근 {hours}시간
            <br />
            커뮤니티 동향
          </h1>
          <p className={styles.description}>
            수집한 게시글의 AI 태그를 기준으로 언급량, 증감, 출처 분포를 집계합니다.
          </p>
          <div className={styles.heroActions}>
            <Link href="#popular-feed" className={styles.primaryLink}>
              인기글 바로 보기 <SouthRoundedIcon fontSize="small" />
            </Link>
            <Link href="/board" className={styles.boardLink}>
              실시간 게시판 <EastRoundedIcon fontSize="small" />
            </Link>
          </div>
        </header>
        <dl className={styles.metrics} aria-label="최근 커뮤니티 집계">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>
                {metric.value === undefined ? (
                  isLoading ? (
                    <Skeleton width="65%" />
                  ) : (
                    '—'
                  )
                ) : (
                  <>
                    {formatActivityCount(metric.value)}
                    <small>{metric.unit}</small>
                  </>
                )}
              </dd>
            </div>
          ))}
        </dl>
        <div className={styles.field}>
          <div className={styles.fieldHeading}>
            <h2>태그별 언급량</h2>
            <span>상위 {topics.length || '—'}개 태그</span>
          </div>
          {isLoading && !data ? (
            <div className={styles.graphLoading} role="status">
              <Skeleton variant="circular" width={120} height={120} />
              <p>태그 통계를 불러오는 중입니다.</p>
            </div>
          ) : topics.length ? (
            <TopicField
              data={data!}
              topics={topics}
              compact={compact}
              staticLayout={staticLayout}
              onTopicSelect={onTopicSelect}
            />
          ) : (
            <div className={styles.graphLoading}>
              <p>
                {isError ? '태그 통계를 불러오지 못했습니다.' : '최근 집계에 AI 태그가 없습니다.'}
              </p>
              <Link href="/board">
                실시간 게시판 보기 <span aria-hidden="true">↗</span>
              </Link>
            </div>
          )}
          <div className={styles.legend}>
            <span>
              <i className={styles.legendCircle} /> 원 크기 · 게시글 수
            </span>
            <span>
              <i className={styles.legendLine} /> 선 · 관련 태그
            </span>
            <span>중심 거리 · 상대 Activity</span>
          </div>
        </div>
      </div>
      {(isError || isRefreshing) && (
        <p className={isError ? styles.error : styles.refresh} role="status">
          {isError
            ? data
              ? '동향 갱신에 실패해 마지막 집계 데이터를 표시합니다.'
              : '동향 데이터를 불러오지 못했습니다. 게시판에서 글을 확인할 수 있습니다.'
            : '동향을 갱신하고 있습니다.'}
        </p>
      )}
      <section className={styles.ranking} aria-labelledby="tag-ranking-title">
        <div className={styles.rankingHeading}>
          <div>
            <p className={styles.sectionLabel}>
              <span>02</span> 태그 순위
            </p>
            <h2 id="tag-ranking-title">많이 언급된 태그</h2>
          </div>
          <span>최근 {hours}시간 · Activity 순</span>
        </div>
        <div className={styles.tableLabels} aria-hidden="true">
          <span>순위</span>
          <span>태그</span>
          <span>게시글</span>
          <span>증감</span>
          <span>Activity</span>
          <span>표시 출처</span>
          <span />
        </div>
        <ol className={styles.rankList}>
          {ranking.map((topic) => (
            <li key={topic.id}>
              <button
                type="button"
                className={styles.rankRow}
                onClick={() => onTopicSelect(topic.label)}
                aria-label={`${topic.rank}위 ${topic.label}, 게시글 ${topic.volume}개, 증감 ${formatActivityGrowth(topic.growthRate)}, Activity ${Math.round(topic.activityScore)}, 출처 ${topic.sourceCount}곳 보기`}
              >
                <span className={styles.rankNumber}>{String(topic.rank).padStart(2, '0')}</span>
                <strong className={styles.rankTag}>#{topic.label}</strong>
                <span className={styles.rankVolume}>
                  {formatActivityCount(topic.volume)}
                  <small>개</small>
                </span>
                <span
                  className={styles.growth}
                  data-direction={
                    topic.growthRate > 0 ? 'up' : topic.growthRate < 0 ? 'down' : 'flat'
                  }
                >
                  {formatActivityGrowth(topic.growthRate)}
                </span>
                <span className={styles.rankActivity}>
                  <span className={styles.mobileActivityLabel}>Activity</span>
                  <span className={styles.meter} aria-hidden="true">
                    <i style={{ width: `${topic.activityScore}%` }} />
                  </span>
                  <b>{Math.round(topic.activityScore)}</b>
                </span>
                <span className={styles.rankSources}>
                  {topic.sourceCount}
                  <small>곳</small>
                </span>
                <EastRoundedIcon className={styles.rankArrow} fontSize="small" />
              </button>
            </li>
          ))}
        </ol>
        {!ranking.length && (
          <div className={styles.rankEmpty} role="status">
            {isLoading ? (
              <Skeleton height={64} />
            ) : isError ? (
              '태그 순위를 불러오지 못했습니다.'
            ) : (
              '분석이 완료된 태그가 여기에 표시됩니다.'
            )}
          </div>
        )}
        <p className={styles.scoreNote}>
          Activity Score는 언급량·증감·출처 수·태그 연결도를 현재 응답 안에서 비교한 상대
          지표입니다.
        </p>
      </section>
    </section>
  );
}

function TopicField({
  data,
  topics,
  compact,
  staticLayout,
  onTopicSelect,
}: {
  data: ActivityData;
  topics: ActivityTopic[];
  compact: boolean;
  staticLayout: boolean;
  onTopicSelect: (tag: string) => void;
}) {
  const fieldRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [geometry, setGeometry] = useState<{
    layouts: TopicLayout[];
    width: number;
    topics: ActivityTopic[];
  } | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const height = compact ? 410 : 430;

  useEffect(() => {
    const field = fieldRef.current;
    if (!field || staticLayout) return undefined;
    let disposed = false;
    let revision = 0;
    let frame = 0;
    let nearViewport = typeof IntersectionObserver === 'undefined';
    let lastWidth = 0;
    const calculate = async () => {
      if (!nearViewport) return;
      const width = Math.round(field.getBoundingClientRect().width);
      if (width < 1 || width === lastWidth) return;
      lastWidth = width;
      revision += 1;
      const currentRevision = revision;
      try {
        const result = await calculateActivityLayout(topics, data.connections, width, height);
        result.simulation.stop();
        if (!disposed && currentRevision === revision)
          setGeometry({ layouts: result.layouts, width, topics });
      } catch {
        // The semantic tag list remains available if visualization cannot load.
      }
    };
    const schedule = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        calculate().catch(() => undefined);
      });
    };
    const observer =
      typeof IntersectionObserver !== 'undefined'
        ? new IntersectionObserver(
            ([entry]) => {
              nearViewport = Boolean(entry?.isIntersecting);
              if (nearViewport) schedule();
            },
            { rootMargin: '100px' }
          )
        : null;
    observer?.observe(field);
    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(schedule) : null;
    resizeObserver?.observe(field);
    schedule();
    return () => {
      disposed = true;
      observer?.disconnect();
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [topics, data.connections, staticLayout, height]);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || staticLayout) return undefined;
    let disposed = false;
    let revert: (() => void) | undefined;
    import('animejs')
      .then(({ animate }) => {
        if (disposed) return;
        const animation = animate(svg, { opacity: [0.7, 1], duration: 260, ease: 'outQuad' });
        revert = () => animation.revert();
      })
      .catch(() => undefined);
    return () => {
      disposed = true;
      revert?.();
    };
  }, [geometry, staticLayout]);

  const ready = !staticLayout && geometry?.topics === topics;
  const layoutById = new Map(geometry?.layouts.map((layout) => [layout.id, layout]));
  const activeTopic = topics.find((topic) => topic.id === activeId);
  const isRelated = (id: string) =>
    !activeId ||
    id === activeId ||
    data.connections.some(
      (connection) =>
        (connection.sourceId === activeId && connection.targetId === id) ||
        (connection.targetId === activeId && connection.sourceId === id)
    );

  return (
    <div ref={fieldRef} className={styles.topicField}>
      {ready ? (
        <svg
          ref={svgRef}
          viewBox={`0 0 ${geometry.width} ${height}`}
          className={styles.universe}
          aria-label="게시글 수에 따른 AI 태그 관계"
          onMouseLeave={() => setActiveId(null)}
        >
          <g aria-hidden="true">
            {data.connections.map((connection) => {
              const source = layoutById.get(connection.sourceId);
              const target = layoutById.get(connection.targetId);
              if (!source || !target) return null;
              return (
                <line
                  key={connection.id}
                  x1={source.x}
                  y1={source.y}
                  x2={target.x}
                  y2={target.y}
                  className={styles.connector}
                  data-active={activeId === source.id || activeId === target.id}
                />
              );
            })}
          </g>
          {topics.map((topic) => {
            const layout = layoutById.get(topic.id)!;
            const labelLength = Math.max(3, Math.floor(layout.radius / 7));
            const label =
              topic.label.length > labelLength
                ? `${topic.label.slice(0, labelLength)}…`
                : topic.label;
            return (
              <g
                key={topic.id}
                transform={`translate(${layout.x} ${layout.y})`}
                className={styles.topicNode}
                data-topic-node={topic.id}
                data-rank={topic.rank}
                data-muted={!isRelated(topic.id)}
                tabIndex={0}
                role="button"
                aria-label={`${topic.label} 태그 게시글 ${topic.volume}개, Activity ${Math.round(topic.activityScore)} 보기`}
                onClick={() => onTopicSelect(topic.label)}
                onKeyDown={(event: KeyboardEvent<SVGGElement>) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onTopicSelect(topic.label);
                  }
                }}
                onMouseEnter={() => setActiveId(topic.id)}
                onFocus={() => setActiveId(topic.id)}
                onBlur={() => setActiveId(null)}
              >
                <title>
                  {topic.label} · {formatActivityCount(topic.volume)}개 게시글 · Activity{' '}
                  {Math.round(topic.activityScore)}
                </title>
                <circle r={layout.radius} />
                <text textAnchor="middle" y={-2} className={styles.nodeLabel}>
                  {label}
                </text>
                <text textAnchor="middle" y={18} className={styles.nodeCount}>
                  {formatActivityCount(topic.volume)}개
                </text>
              </g>
            );
          })}
        </svg>
      ) : (
        <ul className={styles.staticTags} aria-label="태그별 게시글 수">
          {topics.map((topic) => (
            <li key={topic.id}>
              <button
                type="button"
                data-topic-node={topic.id}
                onClick={() => onTopicSelect(topic.label)}
              >
                <strong>#{topic.label}</strong>
                <span>{formatActivityCount(topic.volume)}개</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className={styles.fieldHint}>
        {activeTopic
          ? `#${activeTopic.label} · 게시글 ${formatActivityCount(activeTopic.volume)}개 · 출처 ${activeTopic.sourceCount}곳`
          : '태그를 선택하면 관련 게시글을 볼 수 있습니다.'}
      </p>
    </div>
  );
}

export function formatActivityCount(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

export function formatActivityGrowth(value: number) {
  return `${value > 0 ? '+' : ''}${Math.round(value)}%`;
}

export function formatActivityTime(value?: string) {
  if (!value || !Number.isFinite(Date.parse(value))) return '';
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(new Date(value));
}

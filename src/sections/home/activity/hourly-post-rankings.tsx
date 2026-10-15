'use client';

import type { HourlyPostRanking } from 'src/api/board-api';

import { useId, useRef, useMemo, useState, useEffect } from 'react';

import { UpdateStatus } from './update-status';
import { formatActivityTime } from './activity-format';

// eslint-disable-next-line perfectionist/sort-imports
import styles from './hourly-post-rankings.module.css';

type Props = {
  rankings?: HourlyPostRanking[];
  isLoading: boolean;
  isError: boolean;
  isRefreshing?: boolean;
};

const HOUR_MS = 60 * 60 * 1000;
const PERIODS = [6, 12, 24];
const DASHES = ['', '8 4', '3 4', '10 3 2 3', '2 3', '12 4', '6 3 2 3', '1 4', '9 4 4 4', '4 6'];
const HOUR_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Seoul',
});

function collectPosts(buckets: HourlyPostRanking[]) {
  const posts = new Map<string, HourlyPostRanking['posts'][number]>();
  buckets.toReversed().forEach((bucket) => {
    bucket.posts.forEach((post) => {
      if (!posts.has(post.boardId)) posts.set(post.boardId, post);
    });
  });
  return Array.from(posts.values());
}

function sourceUrl(value: string) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : undefined;
  } catch {
    return undefined;
  }
}

export function HourlyPostRankings({ rankings = [], isLoading, isError, isRefreshing }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const plotRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [period, setPeriod] = useState(24);
  const [selectedPost, setSelectedPost] = useState('');
  const [selectedTime, setSelectedTime] = useState<string>();
  const buckets = useMemo(
    () =>
      rankings
        .filter((bucket) => Number.isFinite(Date.parse(bucket.startedAt)))
        .sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt))
        .slice(-period),
    [rankings, period]
  );
  const availablePosts = useMemo(() => collectPosts(buckets), [buckets]);
  const activePost = availablePosts.some((post) => post.boardId === selectedPost)
    ? selectedPost
    : '';
  const latestPosts = buckets.findLast((bucket) => bucket.posts.length)?.posts ?? [];
  const posts = activePost
    ? availablePosts.filter((post) => post.boardId === activePost)
    : latestPosts.slice(0, 10);
  const activeIndex = Math.max(
    0,
    selectedTime && buckets.some((bucket) => bucket.startedAt === selectedTime)
      ? buckets.findIndex((bucket) => bucket.startedAt === selectedTime)
      : buckets.length - 1
  );
  const activeBucket = buckets[activeIndex];
  const selectedPosts = activePost
    ? posts
    : (activeBucket?.posts ?? []).toSorted((a, b) => a.rank - b.rank).slice(0, 10);
  const hasData = availablePosts.length > 0;
  const hasHistory = buckets.some((bucket) => !bucket.isLive && bucket.capturedAt !== null);

  useEffect(() => {
    const element = plotRef.current;
    if (!element || typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setWidth(Math.max(240, entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasData]);

  const x = (index: number) =>
    buckets.length === 1 ? (width + 20) / 2 : 42 + (index / (buckets.length - 1)) * (width - 62);
  const y = (rank: number) => 24 + ((rank - 1) / 9) * 216;
  const tickEvery = Math.max(1, Math.ceil((buckets.length - 1) / (width < 500 ? 3 : 6)));
  const series = posts.map((post) => {
    const points = buckets.map((bucket, hourIndex) => {
      const entry = bucket.posts.find((item) => item.boardId === post.boardId);
      return entry ? { ...entry, x: x(hourIndex), y: y(entry.rank), hourIndex } : null;
    });
    let path = '';
    points.forEach((point, hourIndex) => {
      if (!point) return;
      const connected =
        hourIndex > 0 &&
        points[hourIndex - 1] &&
        Date.parse(buckets[hourIndex].startedAt) - Date.parse(buckets[hourIndex - 1].startedAt) ===
          HOUR_MS;
      path += `${connected ? 'L' : 'M'}${point.x},${point.y} `;
    });
    const colorIndex = availablePosts.findIndex((item) => item.boardId === post.boardId) % 10;
    return {
      post,
      points,
      path,
      color: `var(--rank-color-${colorIndex + 1})`,
      dash: DASHES[colorIndex],
    };
  });

  return (
    <section id="hourly-post-rankings" className={styles.section} aria-labelledby={titleId}>
      <p className={styles.rule} aria-hidden="true">
        {'+---'.repeat(28)}+
      </p>
      <div className={styles.heading}>
        <h2 id={titleId}>[02] 인기글 순위 변화</h2>
        <div className={styles.periods} role="group" aria-label="인기글 순위 조회 기간">
          {PERIODS.map((hours) => (
            <button
              key={hours}
              type="button"
              aria-pressed={period === hours}
              onClick={() => setPeriod(hours)}
            >
              [{hours}시간]
            </button>
          ))}
        </div>
      </div>
      <div id={descriptionId}>
        {hasData ? (
          <UpdateStatus
            status={isError ? 'error' : isRefreshing ? 'pending' : 'idle'}
            messages={{
              idle: '전체 인기글 Top 10 기준 / 1위가 위쪽 / 한국 시간(KST)',
              pending: '인기글 순위를 갱신하는 중...',
              error: '갱신에 실패해 마지막 인기글 순위를 표시합니다.',
            }}
          />
        ) : (
          <p className={styles.note}>전체 인기글 Top 10 기준 / 한국 시간(KST)</p>
        )}
      </div>
      {!hasData ? (
        <div className={styles.empty} role={isError ? 'alert' : 'status'}>
          {isLoading
            ? '인기글 순위 변화를 불러오는 중...'
            : isError
              ? '인기글 순위 변화를 불러오지 못했습니다.'
              : '아직 표시할 인기글 순위가 없습니다.'}
        </div>
      ) : (
        <>
          <label className={styles.postSelect} htmlFor={`${titleId}-post`}>
            비교 게시글
            <select
              id={`${titleId}-post`}
              value={activePost}
              onChange={(event) => setSelectedPost(event.target.value)}
            >
              <option value="">Top 10 전체</option>
              {availablePosts.map((post) => (
                <option key={post.boardId} value={post.boardId}>
                  {post.title} · {post.siteLabel}
                </option>
              ))}
            </select>
          </label>
          <div ref={plotRef} className={styles.plot}>
            <svg
              viewBox={`0 0 ${width} 284`}
              width="100%"
              height="284"
              role="img"
              aria-labelledby={`${titleId} ${descriptionId}`}
              onPointerMove={(event) => {
                const rect = event.currentTarget.getBoundingClientRect();
                if (!rect.width) return;
                const localX = ((event.clientX - rect.left) / rect.width) * width;
                const index = Math.round(((localX - 42) / (width - 62)) * (buckets.length - 1));
                setSelectedTime(
                  buckets[Math.max(0, Math.min(buckets.length - 1, index))].startedAt
                );
              }}
            >
              <title>시간별 인기글 Top 10의 순위 변화</title>
              <desc>아래 시간 선택 막대에서 각 게시글의 순위를 확인할 수 있습니다.</desc>
              {Array.from({ length: 10 }, (_, index) => index + 1).map((rank) => (
                <g key={rank} className={styles.grid}>
                  <line x1="42" x2={width - 20} y1={y(rank)} y2={y(rank)} />
                  <text x="30" y={y(rank) + 4} textAnchor="end">
                    {rank}위
                  </text>
                </g>
              ))}
              {buckets.map((bucket, index) =>
                index % tickEvery === 0 || index === buckets.length - 1 ? (
                  <text
                    key={bucket.startedAt}
                    x={x(index)}
                    y="270"
                    textAnchor={
                      index === 0 ? 'start' : index === buckets.length - 1 ? 'end' : 'middle'
                    }
                    className={styles.tick}
                  >
                    {HOUR_FORMAT.format(new Date(bucket.startedAt))}
                  </text>
                ) : null
              )}
              <line
                x1={x(activeIndex)}
                x2={x(activeIndex)}
                y1="16"
                y2="246"
                className={styles.cursor}
              />
              {series.map((item) => (
                <g key={item.post.boardId} data-rank-series={item.post.boardId}>
                  <path
                    d={item.path.trim()}
                    fill="none"
                    stroke={item.color}
                    strokeWidth="2"
                    strokeDasharray={item.dash}
                  />
                  {item.points.map(
                    (point) =>
                      point && (
                        <circle
                          key={point.hourIndex}
                          cx={point.x}
                          cy={point.y}
                          r={point.hourIndex === activeIndex ? 4 : 2.5}
                          fill={item.color}
                        >
                          <title>{`${point.title} / ${point.siteLabel} / ${formatActivityTime(buckets[point.hourIndex].startedAt)} / ${point.rank}위`}</title>
                        </circle>
                      )
                  )}
                </g>
              ))}
            </svg>
          </div>
          <label className={styles.timeControl} htmlFor={`${titleId}-time`}>
            <span>
              확인 시간:{' '}
              <time dateTime={activeBucket.startedAt}>
                {formatActivityTime(activeBucket.startedAt)}
              </time>
              {activeBucket.isLive ? ' / 현재 순위' : ''}
            </span>
            <input
              id={`${titleId}-time`}
              type="range"
              aria-label="순위를 확인할 시간"
              aria-valuetext={formatActivityTime(activeBucket.startedAt)}
              min="0"
              max={Math.max(0, buckets.length - 1)}
              step="1"
              value={activeIndex}
              disabled={buckets.length < 2}
              onChange={(event) => setSelectedTime(buckets[Number(event.target.value)].startedAt)}
            />
          </label>
          <ul className={styles.legend} aria-label="선택한 시간의 인기글 순위">
            {selectedPosts.map((selected) => {
              const entry = activeBucket.posts.find((post) => post.boardId === selected.boardId);
              const post = entry ?? selected;
              const colorIndex =
                availablePosts.findIndex((item) => item.boardId === post.boardId) % 10;
              const href = sourceUrl(post.url);
              return (
                <li key={post.boardId}>
                  <a
                    href={href}
                    target={href ? '_blank' : undefined}
                    rel={href ? 'noopener noreferrer' : undefined}
                  >
                    <span
                      className={styles.swatch}
                      style={{ color: `var(--rank-color-${colorIndex + 1})` }}
                      aria-hidden="true"
                    >
                      {DASHES[colorIndex] ? '- -' : '---'}
                    </span>
                    <strong>{post.title}</strong>
                  </a>
                  <span>
                    {post.siteLabel} /{' '}
                    {entry
                      ? `${entry.rank}위`
                      : activeBucket.capturedAt === null
                        ? '순위 기록 없음'
                        : '10위 밖'}
                  </span>
                </li>
              );
            })}
          </ul>
          {!selectedPosts.length && (
            <p className={styles.note} role="status">
              {activeBucket.capturedAt === null
                ? '선택한 시간의 순위 기록이 없습니다.'
                : '선택한 시간에 표시할 인기글이 없습니다.'}
            </p>
          )}
          <p className={styles.note}>
            {activeBucket.capturedAt
              ? `마지막 확인: ${formatActivityTime(activeBucket.capturedAt)} / `
              : ''}
            최근 {buckets.length}개 시간대의 순위를 비교합니다.
            <br />
            {hasHistory
              ? '각 시간대에 마지막으로 확인한 순위입니다.'
              : '아직 시간별 기록이 쌓이지 않아 현재 순위만 표시합니다.'}{' '}
            선이 끊긴 구간은 10위 밖이거나 순위 기록이 없는 시간입니다.
          </p>
        </>
      )}
    </section>
  );
}

'use client';

import type { IssueHourlyRanking } from 'src/api/board-api';

import Link from 'next/link';
import { useId, useRef, useMemo, useState, useEffect } from 'react';

import { UpdateStatus } from './update-status';
import { formatActivityTime, formatActivityCount } from './activity-format';

// Keep CSS modules after application imports (perfectionist/sort-imports).
// eslint-disable-next-line perfectionist/sort-imports
import styles from './hourly-tag-rankings.module.css';

type Props = {
  rankings?: IssueHourlyRanking[];
  isLoading: boolean;
  isError: boolean;
  isRefreshing?: boolean;
};

const HOUR_MS = 60 * 60 * 1000;
const PERIODS = [6, 12, 24];
const DASHES = ['', '8 4', '3 4', '10 3 2 3', '2 3'];
const HOUR_FORMAT = new Intl.DateTimeFormat('ko-KR', {
  hour: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Seoul',
});

function rankTags(buckets: IssueHourlyRanking[]) {
  const totals = new Map<string, number>();
  buckets.forEach((bucket) => {
    bucket.tags.forEach(({ tag, postCount }) => {
      totals.set(tag, (totals.get(tag) ?? 0) + postCount);
    });
  });
  return Array.from(totals).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ko-KR'));
}

export function HourlyTagRankings({ rankings = [], isLoading, isError, isRefreshing }: Props) {
  const titleId = useId();
  const descriptionId = useId();
  const plotRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(800);
  const [period, setPeriod] = useState(24);
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedTime, setSelectedTime] = useState<string>();
  const buckets = useMemo(
    () =>
      rankings
        .filter((bucket) => Number.isFinite(Date.parse(bucket.startedAt)))
        .sort((a, b) => Date.parse(a.startedAt) - Date.parse(b.startedAt))
        .slice(-period),
    [rankings, period]
  );
  const availableTags = useMemo(() => rankTags(buckets), [buckets]);
  const activeTag = availableTags.some(([tag]) => tag === selectedTag) ? selectedTag : '';
  const defaultTags = availableTags.slice(0, 5).map(([tag]) => tag);
  const tags = activeTag ? [activeTag] : defaultTags;
  const activeIndex = Math.max(
    0,
    selectedTime && buckets.some((bucket) => bucket.startedAt === selectedTime)
      ? buckets.findIndex((bucket) => bucket.startedAt === selectedTime)
      : buckets.length - 1
  );
  const activeBucket = buckets[activeIndex];
  const hasData = availableTags.length > 0;

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
  const series = tags.map((tag, index) => {
    const points = buckets.map((bucket, hourIndex) => {
      const entry = bucket.tags.find((item) => item.tag === tag);
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
    const colorIndex = activeTag ? Math.max(0, defaultTags.indexOf(tag)) : index;
    return {
      tag,
      points,
      path,
      color: `var(--rank-color-${colorIndex + 1})`,
      dash: DASHES[colorIndex],
    };
  });

  return (
    <section id="hourly-tag-rankings" className={styles.section} aria-labelledby={titleId}>
      <p className={styles.rule} aria-hidden="true">
        {'+---'.repeat(28)}+
      </p>
      <div className={styles.heading}>
        <h2 id={titleId}>시간별 태그 순위</h2>
        <div className={styles.periods} role="group" aria-label="태그 순위 조회 기간">
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
              idle: '시간별 게시글 수 기준 / 1위가 위쪽 / 한국 시간(KST)',
              pending: '시간별 태그 순위를 갱신하는 중...',
              error: '갱신에 실패해 마지막 시간별 순위를 표시합니다.',
            }}
          />
        ) : (
          <p className={styles.note}>시간별 게시글 수 기준 / 1위가 위쪽 / 한국 시간(KST)</p>
        )}
      </div>
      {!hasData ? (
        <div className={styles.empty} role={isError ? 'alert' : 'status'}>
          {isLoading
            ? '시간별 태그 순위를 불러오는 중...'
            : isError
              ? '시간별 태그 순위를 불러오지 못했습니다.'
              : '아직 표시할 시간별 태그 순위가 없습니다.'}
        </div>
      ) : (
        <>
          <label className={styles.tagSelect} htmlFor={`${titleId}-tag`}>
            비교 태그
            <select
              id={`${titleId}-tag`}
              value={activeTag}
              onChange={(event) => setSelectedTag(event.target.value)}
            >
              <option value="">주요 태그 5개</option>
              {availableTags.map(([tag]) => (
                <option key={tag} value={tag}>
                  #{tag}
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
                const index = Math.round(
                  ((event.clientX - rect.left - 42) / (width - 62)) * (buckets.length - 1)
                );
                setSelectedTime(
                  buckets[Math.max(0, Math.min(buckets.length - 1, index))].startedAt
                );
              }}
            >
              <title>시간별 상위 10위 태그의 순위 변화</title>
              <desc>아래 시간 선택 막대에서 각 시간의 순위와 게시글 수를 확인할 수 있습니다.</desc>
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
                <g key={item.tag} data-rank-series={item.tag}>
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
                          <title>{`#${item.tag} / ${formatActivityTime(buckets[point.hourIndex].startedAt)} / ${point.rank}위 / ${formatActivityCount(point.postCount)}개 게시글`}</title>
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
          <ul className={styles.legend} aria-label="선택한 시간의 태그 순위">
            {series.map((item) => {
              const entry = activeBucket.tags.find((tag) => tag.tag === item.tag);
              return (
                <li key={item.tag}>
                  <Link href={`/board?${new URLSearchParams({ tag: item.tag }).toString()}`}>
                    <span
                      className={styles.swatch}
                      style={{ color: item.color }}
                      aria-hidden="true"
                    >
                      {item.dash ? '- -' : '---'}
                    </span>
                    <strong>#{item.tag}</strong>
                  </Link>
                  <span>
                    {entry
                      ? `${entry.rank}위 / ${formatActivityCount(entry.postCount)}개`
                      : '10위 밖 또는 게시글 없음'}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className={styles.note}>
            최근 {buckets.length}개 시간대 / 현재 시간대는 집계 중입니다.
            <br />
            상위 10위에 오른 태그 중 최대 5개를 비교합니다. 선이 끊긴 구간은 10위 밖이거나 게시글이
            없는 시간입니다.
          </p>
        </>
      )}
    </section>
  );
}

'use client';

import Link from 'next/link';

import { asciiMeter, formatActivityCount } from './activity-format';

import type { ActivityTopic } from './activity-data';

// Keep CSS modules after application imports (perfectionist/sort-imports).
// eslint-disable-next-line perfectionist/sort-imports
import styles from './cross-community-story.module.css';

type Props = { topic?: ActivityTopic | null; windowHours?: number; isError?: boolean };
export function CrossCommunityStory({ topic, windowHours = 24, isError }: Props) {
  const sources = topic?.sources.slice(0, 6) ?? [];
  return (
    <section
      id="cross-community"
      className={styles.sources}
      aria-labelledby="cross-community-title"
    >
      <p className={styles.rule} aria-hidden="true">
        {'-'.repeat(110)}
      </p>
      <h2 id="cross-community-title">[02] 출처별 게시글{topic ? ` / #${topic.label}` : ''}</h2>
      <p className={styles.note}>
        최근 {windowHours}시간 /{' '}
        {topic
          ? `1위 태그 전체 ${formatActivityCount(topic.volume)}개 게시글 기준`
          : '상위 태그의 출처별 분포'}
      </p>
      {sources.length > 0 ? (
        <ol
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Allow keyboard scrolling of the overflow container.
          tabIndex={0}
          className={styles.sourceList}
          aria-label="태그의 출처별 게시글 분포"
        >
          {sources.map((source, index) => (
            <li key={source.id}>
              <span className={styles.rank} aria-hidden="true">
                {String(index + 1).padStart(2, '0')}
              </span>
              <div className={styles.content}>
                <div className={styles.sourceLine}>
                  <Link
                    href={createSourceHref(topic!.label, source.site)}
                    data-source-link
                    aria-label={`${source.name.trim() || source.site}에서 ${topic!.label} 태그 게시글 ${formatActivityCount(source.contribution)}개 보기, 비중 ${Math.round(source.contributionRatio * 100)}%`}
                  >
                    [{source.name.trim() || source.site} &gt;]
                  </Link>
                  <span className={styles.meter}>
                    <span aria-hidden="true">{asciiMeter(source.contributionRatio * 100)}</span>{' '}
                    {Math.round(source.contributionRatio * 100)}%
                  </span>
                </div>
                <p className={styles.note}>
                  <strong>{formatActivityCount(source.contribution)}</strong>개 게시글
                </p>
                <p className={styles.note}>
                  {source.representativePost
                    ? `대표 글: ${source.representativePost.title}`
                    : '연결된 Top 10 글 없음'}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p role="status">
          {isError
            ? '출처 통계를 불러오지 못했습니다.'
            : topic === undefined
              ? '출처 통계를 불러오는 중...'
              : '최근 집계에 출처 통계가 없습니다.'}
        </p>
      )}
      <p className={styles.note}>
        비중은 해당 태그 전체 게시글을 기준으로 계산합니다. 집계에서 확인된 출처만 표시합니다.
      </p>
    </section>
  );
}
function createSourceHref(tag: string, site: string) {
  return `/board?${new URLSearchParams({ tag, sites: site }).toString()}`;
}

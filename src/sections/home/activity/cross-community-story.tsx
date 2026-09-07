'use client';

import Link from 'next/link';

import EastRoundedIcon from '@mui/icons-material/EastRounded';

// Keep CSS modules after external imports (import/order).
// eslint-disable-next-line perfectionist/sort-imports
import styles from './cross-community-story.module.css';

import { formatActivityTime, formatActivityCount, formatActivityGrowth } from './activity-story';

import type { ActivityTopic } from './activity-data';

const MAX_SOURCE_CARDS = 6;

type Props = {
  topic?: ActivityTopic | null;
  windowHours?: number;
  generatedAt?: string;
  isError?: boolean;
  id?: string;
};

export function CrossCommunityStory({
  topic,
  windowHours = 24,
  generatedAt,
  isError,
  id = 'cross-community',
}: Props) {
  const updated = formatActivityTime(generatedAt);
  if (!topic || !topic.sources.length)
    return (
      <section id={id} className={styles.story} aria-labelledby={`${id}-title`}>
        <div className={styles.empty} role="status">
          <p className={styles.sectionLabel}>
            <span>03</span> 출처별 분포
          </p>
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
          <p className={styles.sectionLabel}>
            <span>03</span> 출처별 분포
          </p>
          <h2 id={`${id}-title`}>
            #{topic.label}
            <br />
            출처별 게시글 분포
          </h2>
          <p className={styles.timeNote}>
            최근 {windowHours}시간{updated && <time dateTime={generatedAt}> · {updated} 갱신</time>}
          </p>
          <article className={styles.topicCard} aria-label={`1위 태그 ${topic.label}`}>
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
            6곳 표시합니다.
          </p>
        </div>
        <ol className={styles.sourceList} aria-label={`${topic.label} 태그의 커뮤니티별 분포`}>
          {sources.map((source, index) => {
            const share = Math.min(1, Math.max(0, source.contributionRatio));
            const name = source.name.trim() || source.site;
            return (
              <li key={source.id}>
                <Link
                  href={createSourceHref(topic.label, source.site)}
                  className={styles.sourceCard}
                  aria-label={`${name}에서 ${topic.label} 태그 게시글 ${formatActivityCount(source.contribution)}개 보기`}
                >
                  <div className={styles.sourceHeading}>
                    <span className={styles.sourceNumber}>
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3>{name}</h3>
                    <div className={styles.sourceValues}>
                      <span>
                        <strong>{formatActivityCount(source.contribution)}</strong>개
                      </span>
                      <b>{Math.round(share * 100)}%</b>
                    </div>
                  </div>
                  <div className={styles.sourceMeter} aria-hidden="true">
                    <span style={{ width: `${share * 100}%` }} />
                  </div>
                  <p className={styles.representativePost}>
                    {source.representativePost
                      ? source.representativePost.title
                      : '연결된 Top 10 글 없음'}
                  </p>
                  <span className={styles.cardAction} aria-hidden="true">
                    이 출처에서 보기 <EastRoundedIcon fontSize="small" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

function createSourceHref(tag: string, site: string) {
  const query = new URLSearchParams({ tag, sites: site });
  return `/board?${query.toString()}`;
}

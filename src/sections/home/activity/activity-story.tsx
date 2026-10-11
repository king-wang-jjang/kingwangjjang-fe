'use client';

import type { DailyIssueBriefing } from 'src/api/board-api';

import Link from 'next/link';

import { AsciiLogo } from './ascii-logo';
import { UpdateStatus } from './update-status';
import { formatActivityTime, formatActivityCount } from './activity-format';

// eslint-disable-next-line perfectionist/sort-imports
import styles from './activity-story.module.css';

type Props = {
  data?: DailyIssueBriefing;
  isLoading: boolean;
  isError: boolean;
  isRefreshing?: boolean;
  motionEnabled?: boolean;
  isMotionReduced?: boolean;
  onMotionToggle?: () => void;
};

export function ActivityStory({
  data,
  isLoading,
  isError,
  isRefreshing,
  motionEnabled = false,
  isMotionReduced = false,
  onMotionToggle,
}: Props) {
  const issues = data?.issues ?? [];
  const updated = formatActivityTime(data?.generatedAt);
  return (
    <section
      id="community-pulse"
      className={styles.story}
      aria-labelledby="pulse-title"
      data-ascii-home
    >
      <header>
        <div className={styles.terminalBar}>
          <span aria-hidden="true">[ TODAY / SOCIAL ISSUES ]</span>
          <button
            type="button"
            className={styles.motionToggle}
            aria-label="화면 움직임"
            aria-pressed={motionEnabled && !isMotionReduced}
            disabled={isMotionReduced || !onMotionToggle}
            title={isMotionReduced ? '기기의 모션 감소 설정이 적용되어 있습니다.' : undefined}
            onClick={onMotionToggle}
          >
            [{isMotionReduced ? '모션 감소' : motionEnabled ? '움직임 켜짐' : '움직임 꺼짐'}]
          </button>
        </div>
        <div className={styles.introBody}>
          <div className={styles.introCopy}>
            <h1 id="pulse-title"># 오늘의 사회 이슈</h1>
            <p>오늘 커뮤니티에서 많이 언급된 사회 이슈를 요약합니다.</p>
            <p className={styles.note}>
              {data?.date && <time dateTime={data.date}>{data.date}</time>}
              {data?.date && ' / '}
              한국 시간 00:00부터 집계
              {' / '}갱신:{' '}
              {updated ? (
                <time dateTime={data?.generatedAt}>{updated}</time>
              ) : isLoading ? (
                '불러오는 중...'
              ) : (
                '집계 시각 없음'
              )}
            </p>
          </div>
          <div className={styles.logoPanel}>
            <AsciiLogo motionEnabled={motionEnabled && !isMotionReduced} />
          </div>
        </div>
        <dl className={styles.metrics} aria-label="오늘의 사회 이슈 집계">
          {[
            { label: '관련 게시글', value: data?.totalPosts },
            { label: '사회 이슈', value: data?.totalIssues },
            { label: '커뮤니티', value: data?.sourceCount },
          ].map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}:</dt>
              <dd>{metric.value === undefined ? '-' : formatActivityCount(metric.value)}</dd>
            </div>
          ))}
        </dl>
        <nav className={styles.destinations} aria-label="전체 콘텐츠 탐색">
          <Link href="/board">[실시간 게시판 &gt;]</Link>
          <Link href="/top10">[Top 10 전체 &gt;]</Link>
        </nav>
      </header>

      <section id="today-issues" className={styles.rankings} aria-labelledby="today-issues-title">
        <p className={styles.rule} aria-hidden="true">
          {'+---'.repeat(28)}+
        </p>
        <div className={styles.sectionHeading}>
          <h2 id="today-issues-title">[01] 많이 언급된 이슈</h2>
          <span className={styles.note}>관련 게시글 수 기준</span>
        </div>
        <UpdateStatus
          status={isError ? 'error' : isLoading || isRefreshing ? 'pending' : 'idle'}
          messages={{
            idle: `상위 ${issues.length}개 / 비슷한 사건의 게시글을 묶어 요약`,
            pending: isLoading
              ? '오늘의 사회 이슈를 불러오는 중...'
              : '오늘의 이슈를 갱신하는 중...',
            error: data
              ? '집계 갱신에 실패해 마지막 데이터를 표시합니다.'
              : '오늘의 사회 이슈를 불러오지 못했습니다.',
          }}
        />
        <ol className={styles.issueList} aria-labelledby="today-issues-title">
          {issues.map((issue) => (
            <li key={issue.id}>
              <article className={styles.issueCard} aria-labelledby={`issue-${issue.id}`}>
                <p className={styles.issueMeta}>
                  <span className={styles.rank}>{String(issue.rank).padStart(2, '0')}</span>
                  {issue.rank === 1 && <strong>오늘 가장 많이 언급</strong>}
                  <span>게시글 {formatActivityCount(issue.postCount)}개</span>
                  <span>커뮤니티 {formatActivityCount(issue.sourceCount)}곳</span>
                </p>
                <h3 id={`issue-${issue.id}`}>{issue.title}</h3>
                <p className={styles.issueSummary}>{issue.summary}</p>
                <p className={styles.note}>
                  {issue.sources
                    .map(
                      (source) => `${source.siteLabel} ${formatActivityCount(source.postCount)}개`
                    )
                    .join(' / ')}
                </p>
                <details className={styles.scoreNote}>
                  <summary>[관련 원문 보기]</summary>
                  <ul className={styles.sourcePosts}>
                    {issue.posts
                      .filter((post) => /^https?:\/\//i.test(post.url))
                      .map((post) => (
                        <li key={post.boardId}>
                          <a href={post.url} target="_blank" rel="noopener noreferrer">
                            [{post.siteLabel}] {post.title}
                          </a>
                        </li>
                      ))}
                  </ul>
                </details>
              </article>
            </li>
          ))}
        </ol>
        {!isLoading && !isError && !issues.length && (
          <p role="status">
            아직 오늘의 사회 이슈를 요약할 게시글이 없습니다. 분석이 완료되면 자동으로 반영됩니다.{' '}
            <Link href="/board">[게시판 보기 &gt;]</Link>
          </p>
        )}
        <p className={styles.note}>
          요약은 관련 게시글의 AI 분석에서 모았습니다. 언급량은 수집한 커뮤니티 게시글 기준이며,
          사회적 중요도나 사실 확인을 뜻하지 않습니다.
        </p>
      </section>
    </section>
  );
}

'use client';

import type { DailyIssueBriefing } from 'src/api/board-api';

import Link from 'next/link';
import { useMemo } from 'react';

import { IssueCloseup } from './issue-closeup';
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
  const issues = useMemo(() => data?.issues.slice(0, 10) ?? [], [data?.issues]);
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
          <p className={styles.brandLabel}>
            CLOSEUP <span>/ 오늘의 이슈</span>
          </p>
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
      </header>

      <section id="today-issues" className={styles.closeupSection} aria-label="오늘의 이슈 클로즈업">
        <UpdateStatus
          status={isError ? 'error' : isLoading || isRefreshing ? 'pending' : 'idle'}
          messages={{
            idle: `오늘의 이슈 ${issues.length}개 / 한 이슈씩 가까이 보기`,
            pending: isLoading
              ? '오늘의 사회 이슈를 불러오는 중...'
              : '오늘의 이슈를 갱신하는 중...',
            error: data
              ? '집계 갱신에 실패해 마지막 데이터를 표시합니다.'
              : '오늘의 사회 이슈를 불러오지 못했습니다.',
          }}
        />
        {issues.length > 0 ? (
          <IssueCloseup
            issues={issues}
            motionEnabled={motionEnabled}
            isMotionReduced={isMotionReduced}
          />
        ) : (
          <div className={styles.emptyCloseup}>
            <h1 id="pulse-title">오늘의 이슈</h1>
            {!isLoading && !isError && (
              <p role="status">
                아직 오늘의 사회 이슈를 요약할 게시글이 없습니다. 분석이 완료되면 자동으로 반영됩니다.
              </p>
            )}
            <Link href="/board">[게시판 보기 &gt;]</Link>
          </div>
        )}
      </section>

      <div className={styles.overview}>
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
      </div>
      <p className={styles.note}>
        요약은 관련 게시글의 AI 분석에서 모았습니다. 언급량은 수집한 커뮤니티 게시글 기준이며,
        사회적 중요도나 사실 확인을 뜻하지 않습니다.
      </p>
    </section>
  );
}

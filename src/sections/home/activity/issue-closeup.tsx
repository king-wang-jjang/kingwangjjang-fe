'use client';

import type { DailyIssue } from 'src/api/board-api';

import { useRef, useState, useEffect } from 'react';

import { formatActivityCount } from './activity-format';

// eslint-disable-next-line perfectionist/sort-imports
import styles from './activity-story.module.css';

type Props = {
  issues: DailyIssue[];
  motionEnabled: boolean;
  isMotionReduced: boolean;
};

const ADVANCE_INTERVAL_MS = 12_000;

export function IssueCloseup({ issues, motionEnabled, isMotionReduced }: Props) {
  const closeupRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<string>();
  const [isPlaying, setIsPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isInView, setIsInView] = useState(true);
  const [isDocumentVisible, setIsDocumentVisible] = useState(true);
  const selectedIndex = Math.max(
    0,
    issues.findIndex((issue) => issue.id === selectedId)
  );
  const selectedIssue = issues[selectedIndex];
  const canPlay = motionEnabled && !isMotionReduced && issues.length > 1;
  const isAdvancing =
    canPlay && isPlaying && !isHovered && !isFocused && isInView && isDocumentVisible;

  useEffect(() => {
    const syncVisibility = () => setIsDocumentVisible(!document.hidden);
    syncVisibility();
    document.addEventListener('visibilitychange', syncVisibility);
    return () => document.removeEventListener('visibilitychange', syncVisibility);
  }, []);

  useEffect(() => {
    const element = closeupRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(([entry]) => setIsInView(entry.isIntersecting));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isAdvancing) return undefined;
    const timer = window.setInterval(() => {
      if (!document.hidden) setSelectedId(issues[(selectedIndex + 1) % issues.length].id);
    }, ADVANCE_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [isAdvancing, issues, selectedIndex]);

  const selectIssue = (index: number) => {
    setSelectedId(issues[(index + issues.length) % issues.length].id);
    setIsPlaying(false);
  };

  if (!selectedIssue) return null;
  const summarySource =
    selectedIssue.summarySource ?? (selectedIssue.summary.trim() ? 'ai' : 'pending');

  return (
    <div
      ref={closeupRef}
      className={styles.closeupLayout}
      data-auto-advance={isAdvancing ? 'running' : 'paused'}
      onPointerEnter={(event) => {
        if (event.pointerType !== 'touch') setIsHovered(true);
      }}
      onPointerLeave={() => setIsHovered(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsFocused(false);
      }}
    >
      <div className={styles.closeupPanel}>
        <div className={styles.closeupEyebrow}>
          <span>지금 보는 이슈</span>
          <span className={styles.position} aria-label={`${selectedIndex + 1} / ${issues.length}`}>
            {String(selectedIndex + 1).padStart(2, '0')}
            <span> / {String(issues.length).padStart(2, '0')}</span>
          </span>
        </div>
        <article
          key={selectedIssue.id}
          id="daily-issue-closeup"
          className={styles.closeupArticle}
          data-summary-source={summarySource}
          data-motion={motionEnabled && !isMotionReduced ? 'running' : 'paused'}
          aria-labelledby="pulse-title"
          aria-live={isAdvancing ? 'off' : 'polite'}
          aria-atomic="true"
        >
          <h1 id="pulse-title">{selectedIssue.title}</h1>
          <p className={styles.summaryLabel}>
            {summarySource === 'ai'
              ? 'AI 요약'
              : summarySource === 'source_excerpt'
                ? '원문 발췌 · AI 분석 대기 중'
                : 'AI 요약 준비 중'}
          </p>
          <p className={styles.issueSummary}>
            {selectedIssue.summary ||
              '아직 AI 요약이 준비되지 않았습니다. 아래 관련 원문에서 내용을 확인할 수 있습니다.'}
          </p>
          <p className={styles.issueMeta}>
            <span>게시글 {formatActivityCount(selectedIssue.postCount)}개</span>
            <span>커뮤니티 {formatActivityCount(selectedIssue.sourceCount)}곳</span>
          </p>
          <p className={styles.note}>
            {selectedIssue.sources
              .map((source) => `${source.siteLabel} ${formatActivityCount(source.postCount)}개`)
              .join(' / ')}
          </p>
          {selectedIssue.posts.some((post) => /^https?:\/\//i.test(post.url)) && (
            <details className={styles.sourceDetails}>
              <summary>[관련 원문 보기 ↗]</summary>
              <ul className={styles.sourcePosts}>
                {selectedIssue.posts
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
          )}
        </article>
        <div className={styles.closeupControls} role="group" aria-label="이슈 클로즈업 탐색">
          <button
            type="button"
            aria-label="이전 이슈"
            aria-controls="daily-issue-closeup"
            disabled={issues.length < 2}
            onClick={() => selectIssue(selectedIndex - 1)}
          >
            [← 이전]
          </button>
          <button
            type="button"
            className={styles.playToggle}
            aria-label="이슈 자동 넘김"
            aria-pressed={canPlay && isPlaying}
            disabled={!canPlay}
            title={isMotionReduced ? '기기의 모션 감소 설정이 적용되어 있습니다.' : undefined}
            onClick={() => {
              setIsPlaying((playing) => !playing);
              setIsFocused(false);
            }}
          >
            {canPlay && isPlaying ? '[Ⅱ 자동 넘김 중]' : '[▷ 자동 넘김]'}
          </button>
          <button
            type="button"
            aria-label="다음 이슈"
            aria-controls="daily-issue-closeup"
            disabled={issues.length < 2}
            onClick={() => selectIssue(selectedIndex + 1)}
          >
            [다음 →]
          </button>
        </div>
        <div className={styles.progressTrack} aria-hidden="true">
          <span
            key={`${selectedIssue.id}-${isAdvancing}`}
            className={styles.progressFill}
            style={{ animationDuration: `${ADVANCE_INTERVAL_MS}ms` }}
          />
        </div>
        <p className={styles.playbackNote}>
          {canPlay && isPlaying
            ? '12초마다 한 이슈씩 · 읽거나 선택하는 동안 잠시 멈춥니다.'
            : '목록에서 고르거나 이전·다음으로 한 이슈씩 살펴보세요.'}
        </p>
      </div>
      <section className={styles.issueBoard} aria-labelledby="today-issues-title">
        <div className={styles.boardHeading}>
          <h2 id="today-issues-title">[01] 오늘의 이슈</h2>
          <span>{String(issues.length).padStart(2, '0')}개</span>
        </div>
        <p className={styles.boardNote}>제목을 고르면 크게 볼 수 있습니다.</p>
        <ol className={styles.issueList} aria-labelledby="today-issues-title">
          {issues.map((issue, index) => (
            <li key={issue.id}>
              <button
                type="button"
                className={styles.issueButton}
                aria-label={`${index + 1}위 이슈 클로즈업: ${issue.title}`}
                aria-pressed={selectedIndex === index}
                aria-controls="daily-issue-closeup"
                onClick={() => selectIssue(index)}
              >
                <span className={styles.rank} aria-hidden="true">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className={styles.listTitle}>{issue.title}</span>
                <span className={styles.listCount} aria-label={`관련 게시글 ${issue.postCount}개`}>
                  {formatActivityCount(issue.postCount)}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className={styles.boardNote}>관련 게시글 수 기준 · 최대 10개</p>
      </section>
    </div>
  );
}

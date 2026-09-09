'use client';

import type { BoardPost } from 'src/api/board-api';

import Link from 'next/link';
import { useRef, useMemo, useState, useEffect } from 'react';

import { getPostSummary } from 'src/components/board-post/board-post-utils';

import { UpdateStatus } from './update-status';

// Keep the local stylesheet after application imports to match the repository import groups.
// eslint-disable-next-line perfectionist/sort-imports
import styles from './trending-post-feed.module.css';

type FeedMode = 'popular' | 'reaction' | 'latest';

type RankedPost = {
  key: string;
  originalRank: number;
  post: BoardPost;
};

export type TrendingPostFeedProps = {
  posts: readonly BoardPost[];
  isLoading: boolean;
  isError: boolean;
  featuredTag?: string;
  isRefreshing?: boolean;
};

const FEED_MODES: ReadonlyArray<{ id: FeedMode; label: string }> = [
  { id: 'popular', label: '인기' },
  { id: 'reaction', label: '반응' },
  { id: 'latest', label: '최신' },
];

const COUNT_FORMATTER = new Intl.NumberFormat('ko-KR', { notation: 'compact' });
const SCORE_FORMATTER = new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 });
const POST_TIME_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Asia/Seoul',
});

export function TrendingPostFeed({
  posts,
  isLoading,
  isError,
  featuredTag,
  isRefreshing,
}: TrendingPostFeedProps) {
  const [mode, setMode] = useState<FeedMode>('popular');
  const [selectedPostKey, setSelectedPostKey] = useState<string | null>(null);

  const rankedPosts = useMemo(
    () =>
      posts.slice(0, 10).map((post, index) => ({
        post,
        originalRank: index + 1,
        key: getPostKey(post, index),
      })),
    [posts]
  );
  const visiblePosts = useMemo(() => sortPosts(rankedPosts, mode), [mode, rankedPosts]);

  let stateMessage;
  if (isLoading && posts.length === 0) {
    stateMessage = (
      <p className={styles.stateMessage} role="status">
        [불러오는 중] 인기글을 불러오고 있습니다.
      </p>
    );
  } else if (isError && posts.length === 0) {
    stateMessage = (
      <div className={styles.stateMessage} role="alert">
        <p>[오류] 인기글을 불러오지 못했습니다.</p>
        <Link href="/board">[실시간 게시판 보기]</Link>
      </div>
    );
  } else if (posts.length === 0) {
    stateMessage = (
      <div className={styles.stateMessage}>
        <p>아직 집계된 인기글이 없습니다. Top 10 집계 후 게시글이 표시됩니다.</p>
        <Link href="/board">[실시간 게시판 보기]</Link>
      </div>
    );
  }

  return (
    <section className={styles.feed} aria-labelledby="trending-post-feed-title">
      <div className={styles.inner} aria-busy={isLoading || isRefreshing}>
        <p className={styles.separator} aria-hidden="true">
          {'='.repeat(110)}
        </p>
        <div className={styles.heading}>
          <h2 id="trending-post-feed-title">[03] 오늘의 인기글</h2>
          <Link href="/top10" className={styles.sectionLink}>
            [Top 10 전체 보기 &gt;]
          </Link>
        </div>
        <UpdateStatus
          status={
            posts.length > 0 ? (isError ? 'error' : isRefreshing ? 'pending' : 'idle') : 'idle'
          }
          messages={{
            idle: '제목 선택: 전체 제목과 요약 펼치기',
            pending: '[갱신 중] 인기글을 갱신하고 있습니다.',
            error: '최신 목록 갱신에 실패해 현재 확인 가능한 데이터를 표시합니다.',
          }}
        />

        {stateMessage ?? (
          <>
            <div className={styles.toolbar}>
              <div role="group" aria-label="인기글 정렬 기준" className={styles.modeTabs}>
                {FEED_MODES.map((item) => (
                  <button
                    key={item.id}
                    id={`post-feed-mode-${item.id}`}
                    type="button"
                    aria-label={item.label}
                    aria-pressed={mode === item.id}
                    aria-controls="trending-post-list"
                    onClick={() => {
                      setMode(item.id);
                      setSelectedPostKey(null);
                    }}
                    className={styles.modeTab}
                  >
                    [{item.label}]
                  </button>
                ))}
              </div>
              <p className={styles.modeDescription} aria-live="polite">
                {getModeDescription(mode)}
              </p>
            </div>

            <ol
              id="trending-post-list"
              aria-labelledby={`post-feed-mode-${mode}`}
              className={styles.postList}
            >
              {visiblePosts.map((entry, index) => {
                const selected = entry.key === selectedPostKey;
                const previewId = `trending-post-preview-${entry.originalRank}`;

                return (
                  <li key={entry.key}>
                    <div className={styles.postRow}>
                      <button
                        type="button"
                        aria-expanded={selected}
                        aria-controls={previewId}
                        aria-label={`${index + 1}위, ${getSourceLabel(entry.post)}, ${entry.post.title} 미리보기`}
                        onClick={() => setSelectedPostKey(selected ? null : entry.key)}
                        className={styles.postButton}
                      >
                        <span className={styles.rank} aria-hidden="true">
                          {selected ? '>' : ' '} {String(index + 1).padStart(2, '0')}.
                        </span>
                        <CompactPostTitle title={entry.post.title} />
                      </button>
                      <Link
                        href={`/top10?rank=${entry.originalRank}`}
                        className={styles.directLink}
                        aria-label={`${entry.post.title} 상세 페이지로 이동`}
                      >
                        [상세]
                      </Link>
                    </div>
                    <div id={previewId} hidden={!selected}>
                      {selected && (
                        <PostPreview entry={entry} mode={mode} featuredTag={featuredTag} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </>
        )}
      </div>
    </section>
  );
}

function CompactPostTitle({ title }: { title: string }) {
  const containerRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [isClipped, setIsClipped] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) {
      return undefined;
    }

    const measure = () => setIsClipped(text.scrollWidth > container.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [title]);

  return (
    <strong ref={containerRef} className={styles.postTitle} title={title}>
      <span ref={textRef} className={styles.postTitleText}>
        {title}
      </span>
      {isClipped && <span aria-hidden="true">...</span>}
    </strong>
  );
}

function PostPreview({
  entry,
  mode,
  featuredTag,
}: {
  entry: RankedPost;
  mode: FeedMode;
  featuredTag?: string;
}) {
  const { post, originalRank } = entry;
  const summary = getPostSummary(post);
  const tags = uniqueTags(post.tags).slice(0, 5);
  const metrics = getPostMetrics(post);
  const postTime = formatPostTime(post.createTime);
  const sourceUrl = getSafeSourceUrl(post.url);

  return (
    <article
      id="trending-post-preview"
      className={styles.preview}
      aria-label={`선택한 인기글: ${post.title}`}
      aria-live="polite"
    >
      <p className={styles.note}>[선택한 글] / Top 10 #{String(originalRank).padStart(2, '0')}</p>
      <h3>{post.title}</h3>
      <p className={styles.note}>
        {getSourceLabel(post)}
        {postTime && (
          <>
            {' / '}
            <time dateTime={post.createTime}>{postTime}</time>
          </>
        )}
        {' / '}
        {getModeLabel(mode)} 기준
      </p>
      {tags.length > 0 && (
        <p className={styles.note} aria-label="AI가 분석한 태그">
          {tags.map((tag) => `#${tag}`).join(' ')}
        </p>
      )}
      {featuredTag && <p className={styles.note}>24시간 1위 태그: #{featuredTag}</p>}
      <div className={styles.summary}>
        <p>AI 요약:</p>
        <p>{summary || '아직 제공된 요약이 없습니다.'}</p>
      </div>
      {metrics.length > 0 && (
        <dl className={styles.metrics} aria-label="실제 게시글 지표">
          {metrics.map((metric) => (
            <div key={metric.label}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      )}
      <div className={styles.previewActions}>
        <Link href={`/top10?rank=${originalRank}`} aria-label={`${originalRank}위 글 자세히 보기`}>
          [{originalRank}위 글 자세히 보기]
        </Link>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="원문 열기, 새 탭"
          >
            [원문 열기]
          </a>
        )}
      </div>
    </article>
  );
}

function sortPosts(posts: readonly RankedPost[], mode: FeedMode) {
  if (mode === 'popular') {
    return [...posts];
  }

  return [...posts].sort((left, right) => {
    if (mode === 'latest') {
      const leftTime = getTimestamp(left.post.createTime);
      const rightTime = getTimestamp(right.post.createTime);
      if (leftTime !== rightTime) {
        return rightTime - leftTime;
      }
    } else {
      const leftScore = getReactionScore(left.post);
      const rightScore = getReactionScore(right.post);
      if (leftScore != null && rightScore == null) {
        return -1;
      }
      if (leftScore == null && rightScore != null) {
        return 1;
      }
      if (leftScore != null && rightScore != null && leftScore !== rightScore) {
        return rightScore - leftScore;
      }
    }
    return left.originalRank - right.originalRank;
  });
}

function getPostKey(post: BoardPost, index: number) {
  return post.Id?.trim() || `${post.site}:${post.no}:${index}`;
}

function getReactionScore(post: BoardPost) {
  return toFiniteMetric(post.dailyScore) ?? toFiniteMetric(post.hotScore);
}

function getTimestamp(value: string) {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : Number.NEGATIVE_INFINITY;
}

function getPostMetrics(post: BoardPost) {
  const metrics: Array<{ label: string; value: string }> = [];
  const viewCount = toFiniteMetric(post.nativeViewCount);
  const likeCount = toFiniteMetric(post.nativeLikeCount) ?? toFiniteMetric(post.likeCount);
  const commentCount = toFiniteMetric(post.nativeCommentCount) ?? toFiniteMetric(post.commentCount);
  const reactionScore = getReactionScore(post);

  if (viewCount != null) {
    metrics.push({ label: '조회', value: COUNT_FORMATTER.format(viewCount) });
  }
  if (likeCount != null) {
    metrics.push({ label: '좋아요', value: COUNT_FORMATTER.format(likeCount) });
  }
  if (commentCount != null) {
    metrics.push({ label: '댓글', value: COUNT_FORMATTER.format(commentCount) });
  }
  if (reactionScore != null) {
    metrics.push({
      label: toFiniteMetric(post.dailyScore) != null ? '일간 점수' : '반응 점수',
      value: SCORE_FORMATTER.format(reactionScore),
    });
  }
  return metrics;
}

function toFiniteMetric(value?: number | null) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function uniqueTags(tags?: string[]) {
  const labels = new Map<string, string>();
  tags?.forEach((tag) => {
    const trimmed = tag.trim().replace(/^#+\s*/, '');
    if (trimmed) {
      labels.set(trimmed.normalize('NFKC').toLocaleLowerCase('ko-KR'), trimmed);
    }
  });
  return Array.from(labels.values());
}

function getSourceLabel(post: BoardPost) {
  return post.siteLabel.trim() || post.site.trim() || '출처 미표기';
}

function getSafeSourceUrl(value: string) {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : '';
}

function formatPostTime(value: string) {
  const timestamp = getTimestamp(value);
  return Number.isFinite(timestamp) ? POST_TIME_FORMATTER.format(timestamp) : '';
}

function getModeLabel(mode: FeedMode) {
  return FEED_MODES.find((item) => item.id === mode)?.label ?? '인기';
}

function getModeDescription(mode: FeedMode) {
  if (mode === 'reaction') {
    return '일간 / 반응 점수순';
  }
  if (mode === 'latest') {
    return '게시 시각순';
  }
  return 'Top 10 순위순';
}

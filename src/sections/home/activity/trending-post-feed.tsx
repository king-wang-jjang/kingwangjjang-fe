'use client';

import type { CSSProperties } from 'react';
import type { BoardPost } from 'src/api/board-api';

import Link from 'next/link';
import { useRef, useMemo, useState } from 'react';

import EastRoundedIcon from '@mui/icons-material/EastRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import { Box, Alert, Button, Skeleton, ButtonBase, Typography } from '@mui/material';

import { getPostSummary, resolveThumbnailSrc } from 'src/components/board-post/board-post-utils';

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
}: TrendingPostFeedProps) {
  const [mode, setMode] = useState<FeedMode>('popular');
  const [selectedPostKey, setSelectedPostKey] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement | null>(null);

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
  const selectedPost =
    visiblePosts.find((entry) => entry.key === selectedPostKey) ?? visiblePosts[0];

  const handlePostSelect = (postKey: string, revealOnMobile: boolean) => {
    setSelectedPostKey(postKey);

    if (!revealOnMobile || !window.matchMedia('(max-width: 760px)').matches) {
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.requestAnimationFrame(() => {
      previewRef.current?.scrollIntoView({
        behavior: reducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  if (isLoading && posts.length === 0) {
    return <TrendingPostFeedSkeleton />;
  }

  if (isError && posts.length === 0) {
    return (
      <Alert severity="warning" className={styles.stateMessage}>
        인기글을 불러오지 못했습니다. 실시간 게시판에서 최신 글을 계속 확인할 수 있습니다.
      </Alert>
    );
  }

  if (posts.length === 0) {
    return (
      <Box className={styles.emptyState}>
        <Typography component="strong">아직 집계된 인기글이 없습니다.</Typography>
        <Typography component="p">Top 10 집계 후 게시글이 표시됩니다.</Typography>
        <Button component={Link} href="/board" endIcon={<EastRoundedIcon />}>
          실시간 게시판 보기
        </Button>
      </Box>
    );
  }

  return (
    <Box component="section" className={styles.feed} aria-labelledby="trending-post-feed-title">
      <Box className={styles.inner} aria-busy={isLoading}>
        <Box className={styles.heading}>
          <Box>
            <Typography component="p" className={styles.eyebrow}>
              DAILY TOP 10
            </Typography>
            <Typography component="h2" id="trending-post-feed-title">
              오늘의 인기글
            </Typography>
            <Typography component="p" className={styles.description}>
              Top 10 순위와 게시글별 AI 요약·태그를 표시합니다.
            </Typography>
          </Box>

          {featuredTag && (
            <Typography component="p" className={styles.featuredTag}>
              <span aria-hidden="true">●</span> 24시간 1위 태그&nbsp; #{featuredTag}
            </Typography>
          )}
        </Box>

        {isError && (
          <Alert severity="warning" className={styles.inlineAlert}>
            최신 목록 갱신에 실패해 현재 확인 가능한 데이터를 표시합니다.
          </Alert>
        )}

        <Box className={styles.toolbar}>
          <Box role="group" aria-label="인기글 정렬 기준" className={styles.modeTabs}>
            {FEED_MODES.map((item) => (
              <ButtonBase
                key={item.id}
                id={`post-feed-mode-${item.id}`}
                type="button"
                aria-pressed={mode === item.id}
                aria-controls="trending-post-list"
                onClick={() => setMode(item.id)}
                className={`${styles.modeTab} ${mode === item.id ? styles.modeTabActive : ''}`}
              >
                {item.label}
              </ButtonBase>
            ))}
          </Box>

          <Typography component="p" className={styles.modeNote} aria-live="polite">
            {getModeDescription(mode)}
          </Typography>
        </Box>

        <Box className={styles.contentGrid}>
          <Box
            component="ol"
            id="trending-post-list"
            aria-labelledby={`post-feed-mode-${mode}`}
            className={styles.postList}
          >
            {visiblePosts.map((entry, index) => {
              const selected = entry.key === selectedPost?.key;
              const postTime = formatPostTime(entry.post.createTime);
              const tags = uniqueTags(entry.post.tags).slice(0, 2);
              const containsFeaturedTag = featuredTag
                ? tagsInclude(entry.post.tags, featuredTag)
                : false;

              return (
                <Box
                  component="li"
                  key={entry.key}
                  className={styles.postItem}
                  style={{ '--feed-index': index } as CSSProperties}
                >
                  <ButtonBase
                    type="button"
                    aria-pressed={selected}
                    aria-controls="trending-post-preview"
                    aria-label={`${index + 1}위, ${getSourceLabel(entry.post)}, ${entry.post.title} 미리보기`}
                    onClick={(event) => handlePostSelect(entry.key, event.detail > 0)}
                    className={`${styles.postButton} ${selected ? styles.postButtonSelected : ''}`}
                  >
                    <Typography
                      component="span"
                      className={styles.rank}
                      aria-label={`${index + 1}위`}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </Typography>

                    <Box component="span" className={styles.postCopy}>
                      <Box component="span" className={styles.postMeta}>
                        <Typography component="span">{getSourceLabel(entry.post)}</Typography>
                        {postTime && (
                          <Typography component="time" dateTime={entry.post.createTime}>
                            {postTime}
                          </Typography>
                        )}
                        {containsFeaturedTag && (
                          <Typography component="span" className={styles.topicMatch}>
                            1위 태그 포함
                          </Typography>
                        )}
                      </Box>

                      <Typography component="strong" className={styles.postTitle}>
                        {entry.post.title}
                      </Typography>

                      {tags.length > 0 && (
                        <Box component="span" className={styles.rowTags} aria-label="AI 태그">
                          {tags.map((tag) => (
                            <Typography component="span" key={tag}>
                              #{tag}
                            </Typography>
                          ))}
                        </Box>
                      )}
                    </Box>

                    <Typography component="span" className={styles.rowIndicator} aria-hidden="true">
                      ──
                    </Typography>
                  </ButtonBase>
                </Box>
              );
            })}
          </Box>

          <Box ref={previewRef} className={styles.previewSlot}>
            {selectedPost && (
              <PostPreview entry={selectedPost} featuredTag={featuredTag} mode={mode} />
            )}
          </Box>
        </Box>

        <Box className={styles.footerLink}>
          <Button component={Link} href="/top10" endIcon={<EastRoundedIcon />}>
            전체 Top 10 보기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function PostPreview({
  entry,
  featuredTag,
  mode,
}: {
  entry: RankedPost;
  featuredTag?: string;
  mode: FeedMode;
}) {
  const [failedThumbnail, setFailedThumbnail] = useState('');
  const { post, originalRank } = entry;
  const resolvedThumbnail = resolveThumbnailSrc(post.thumbnail);
  const thumbnail = resolvedThumbnail === failedThumbnail ? '' : resolvedThumbnail;
  const summary = getPostSummary(post);
  const tags = uniqueTags(post.tags).slice(0, 5);
  const metrics = getPostMetrics(post);
  const postTime = formatPostTime(post.createTime);
  const sourceUrl = getSafeSourceUrl(post.url);

  return (
    <Box
      component="article"
      id="trending-post-preview"
      className={styles.preview}
      aria-label={`선택한 인기글: ${post.title}`}
      aria-live="polite"
    >
      <Box className={styles.previewMedia}>
        {thumbnail ? (
          <Box
            component="img"
            src={thumbnail}
            alt=""
            className={styles.previewImage}
            onError={() => setFailedThumbnail(resolvedThumbnail)}
          />
        ) : (
          <Box className={styles.thumbnailFallback} aria-hidden="true">
            <Typography component="span">{getSourceLabel(post).slice(0, 1)}</Typography>
            <Typography component="small">IMAGE NOT PROVIDED</Typography>
          </Box>
        )}

        <Box className={styles.mediaLabel}>
          <Typography component="span">TOP 10</Typography>
          <Typography component="strong">#{String(originalRank).padStart(2, '0')}</Typography>
        </Box>
      </Box>

      <Box className={styles.previewBody}>
        <Box className={styles.previewByline}>
          <Typography component="span">{getSourceLabel(post)}</Typography>
          {postTime && (
            <Typography component="time" dateTime={post.createTime}>
              {postTime}
            </Typography>
          )}
          <Typography component="span">{getModeLabel(mode)} 기준</Typography>
        </Box>

        <Typography component="h3">{post.title}</Typography>

        {tags.length > 0 && (
          <Box className={styles.previewTags} aria-label="AI가 분석한 태그">
            {tags.map((tag) => (
              <Typography
                component="span"
                key={tag}
                className={isSameTag(tag, featuredTag) ? styles.previewTagActive : undefined}
              >
                #{tag}
              </Typography>
            ))}
          </Box>
        )}

        {summary && (
          <Box className={styles.summary}>
            <Typography component="span">AI SUMMARY</Typography>
            <Typography component="p">{summary}</Typography>
          </Box>
        )}

        {metrics.length > 0 && (
          <Box className={styles.metrics} aria-label="실제 게시글 지표">
            {metrics.map((metric) => (
              <Box key={metric.label}>
                <Typography component="span">{metric.label}</Typography>
                <Typography component="strong">{metric.value}</Typography>
              </Box>
            ))}
          </Box>
        )}

        <Box className={styles.previewActions}>
          <Button
            component={Link}
            href={`/top10?rank=${originalRank}`}
            variant="contained"
            disableElevation
            endIcon={<EastRoundedIcon />}
          >
            {originalRank}위 글 자세히 보기
          </Button>
          {sourceUrl && (
            <Button
              component="a"
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="원문 열기, 새 탭"
              endIcon={<OpenInNewRoundedIcon />}
            >
              원문 열기
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function TrendingPostFeedSkeleton() {
  return (
    <Box
      component="section"
      className={`${styles.feed} ${styles.loading}`}
      aria-label="인기글을 불러오는 중"
    >
      <Box className={styles.inner}>
        <Box className={styles.heading}>
          <Box>
            <Skeleton width={140} />
            <Skeleton width={280} height={58} />
            <Skeleton width={360} />
          </Box>
        </Box>
        <Box className={styles.contentGrid}>
          <Box className={styles.postList}>
            {Array.from({ length: 5 }).map((_, index) => (
              <Box key={index} className={styles.skeletonRow}>
                <Skeleton width={32} height={32} />
                <Box>
                  <Skeleton width={120} />
                  <Skeleton width={index % 2 ? '72%' : '88%'} height={28} />
                </Box>
              </Box>
            ))}
          </Box>
          <Skeleton variant="rounded" className={styles.previewSkeleton} />
        </Box>
      </Box>
    </Box>
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

function tagsInclude(tags: string[] | undefined, featuredTag: string) {
  return uniqueTags(tags).some((tag) => isSameTag(tag, featuredTag));
}

function isSameTag(tag: string, featuredTag?: string) {
  if (!featuredTag) {
    return false;
  }

  return normalizeTag(tag) === normalizeTag(featuredTag);
}

function normalizeTag(tag: string) {
  return tag
    .normalize('NFKC')
    .trim()
    .replace(/^#+\s*/, '')
    .toLocaleLowerCase('ko-KR');
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
    return '실제 일간·반응 점수가 있는 글부터 정렬';
  }
  if (mode === 'latest') {
    return '실제 게시 시각이 최근인 글부터 정렬';
  }
  return 'Top 10 API가 제공한 순서';
}

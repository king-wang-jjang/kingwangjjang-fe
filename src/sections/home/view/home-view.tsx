'use client';

import type { IssueTag, BoardPost } from 'src/api/board-api';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import EastRoundedIcon from '@mui/icons-material/EastRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Box, Alert, Button, Skeleton, ButtonBase, Typography } from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';

import { useTopBoards } from 'src/hooks/use-top-boards';
import { useIssueOverview } from 'src/hooks/use-issue-overview';

import { TagBriefing, formatMomentum } from 'src/components/issues';
import { getPostSummary, resolveThumbnailSrc } from 'src/components/board-post/board-post-utils';

// CSS modules stay after application imports to satisfy the repository import groups.
// eslint-disable-next-line perfectionist/sort-imports
import styles from './home-view.module.css';

const STORY_TONES = ['toneBrick', 'toneOlive', 'toneBlue', 'toneOchre'] as const;

export function HomeView() {
  const router = useRouter();
  const issueOverviewQuery = useIssueOverview();
  const topBoardsQuery = useTopBoards();
  const [selectedRank, setSelectedRank] = useState(0);
  const overview = issueOverviewQuery.data;
  const tags = overview?.tags ?? [];
  const topBoards = topBoardsQuery.data ?? [];
  const activeRank = topBoards[selectedRank] ? selectedRank : 0;
  const activePost = topBoards[activeRank];
  const sourceCount = getSourceLabels(tags).length;
  const tagAssignments = tags.reduce((total, tag) => total + tag.postCount, 0);

  const handleTagSelect = (tag: string | undefined) => {
    if (!tag) {
      return;
    }

    const query = new URLSearchParams({ tag });
    router.push(`/board?${query.toString()}`);
  };

  return (
    <Box className={styles.home}>
      <Box component="main" className={styles.page}>
        <Box component="section" className={styles.hero}>
          <Box className={styles.issueLine}>
            <Typography component="span">COMMUNITY BRIEF</Typography>
            <Typography component="span">최근 {overview?.windowHours ?? 24}시간</Typography>
            <Typography component="span">{formatGeneratedAt(overview?.generatedAt)}</Typography>
          </Box>

          <Box className={styles.heroGrid}>
            <Box className={styles.heroCopy}>
              <Typography component="p" className={styles.eyebrow}>
                여러 커뮤니티에서 반복된 말
              </Typography>
              <Typography component="h1">
                지금 사람들이
                <br /> 같이 말하는 것
              </Typography>
              <Typography component="p" className={styles.heroDescription}>
                새 글을 수집하면 AI가 본문을 읽고 요약과 태그를 만듭니다. 첫 화면의 수치도 그
                태그만을 기준으로 다시 계산했습니다.
              </Typography>
              <Box className={styles.heroActions}>
                <Button
                  component="a"
                  href="#tag-index"
                  className={styles.primaryAction}
                  endIcon={<ArrowForwardRoundedIcon />}
                >
                  태그 브리핑 보기
                </Button>
                <Button component={Link} href="/board" className={styles.secondaryAction}>
                  실시간 게시판
                </Button>
              </Box>
            </Box>

            <LeadTag tag={tags[0]} isLoading={issueOverviewQuery.isPending} />
          </Box>

          <StatsBand
            isLoading={issueOverviewQuery.isPending}
            totalPosts={overview?.totalPosts}
            totalTags={overview?.totalTags}
            tagAssignments={tagAssignments}
            sourceCount={sourceCount}
          />
        </Box>

        <Box component="section" id="tag-index" className={styles.section}>
          <SectionHeading
            index="01"
            eyebrow="AI TAG INDEX"
            title="24시간 태그 브리핑"
            description="AI 분석이 끝난 글의 태그를 펼쳐 빈도와 게시물 반응을 함께 계산했습니다. 행을 누르면 해당 태그의 글만 모아 볼 수 있습니다."
            actionHref="/board"
            actionLabel="전체 게시판"
          />

          <TagBriefing
            overview={overview}
            isLoading={issueOverviewQuery.isPending}
            isError={issueOverviewQuery.isError}
            onTagSelect={handleTagSelect}
          />

          <Box className={styles.methodNote}>
            <Typography component="strong">집계 기준</Typography>
            <Typography component="p">
              분석 상태가 완료이고 AI 태그가 있는 글만 포함합니다. 한 글에 여러 태그가 붙을 수 있어
              ‘태그 연결’은 ‘분석 게시물’보다 클 수 있습니다. 증가율은 최근 절반 구간과 직전 절반
              구간을 비교합니다.
            </Typography>
          </Box>
        </Box>

        <Box component="section" id="top-stories" className={styles.section}>
          <SectionHeading
            index="02"
            eyebrow="TODAY'S TOP 10"
            title="오늘 많이 읽힌 글"
            description="순위를 고르면 AI 요약과 태그를 먼저 확인할 수 있습니다. 원문이 필요한 글만 자세히 열어보세요."
            actionHref="/top10/"
            actionLabel="TOP 10 전체보기"
          />

          <TopStoriesShowcase
            posts={topBoards}
            activeRank={activeRank}
            activePost={activePost}
            isLoading={topBoardsQuery.isPending}
            isError={topBoardsQuery.isError}
            onRankSelect={setSelectedRank}
          />
        </Box>

        <Box component="section" className={styles.closing}>
          <Typography component="p">원문을 다 읽기 전에, 지금의 맥락부터.</Typography>
          <Typography component="h2">새 글은 수집 직후 요약되고 태그 통계에 이어집니다.</Typography>
          <Button component={Link} href="/board" endIcon={<EastRoundedIcon />}>
            최신 글 확인하기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function LeadTag({ tag, isLoading }: { tag?: IssueTag; isLoading: boolean }) {
  if (isLoading) {
    return (
      <Box className={styles.leadTag} aria-label="대표 태그를 불러오는 중">
        <Skeleton width={120} />
        <Skeleton width="72%" height={70} />
        <Skeleton width="88%" />
        <Skeleton width="64%" />
      </Box>
    );
  }

  if (!tag) {
    return (
      <Box className={styles.leadTag}>
        <Typography component="span" className={styles.leadLabel}>
          TODAY&apos;S NOTE
        </Typography>
        <Typography component="h2">분석 결과를 기다리고 있습니다.</Typography>
        <Typography component="p">
          AI 태그가 생성되면 가장 영향력이 큰 주제를 이 자리에 보여드립니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box className={styles.leadTag}>
      <Box className={styles.leadTopline}>
        <Typography component="span" className={styles.leadLabel}>
          가장 크게 포착된 태그
        </Typography>
        <Typography component="span">01</Typography>
      </Box>
      <Typography component="h2">#{tag.tag}</Typography>
      <Typography component="p">
        {formatCount(tag.postCount)}개 글에서 확인됐고, 태그 전체 영향도의{' '}
        {Math.round(tag.share * 100)}%를 차지합니다.
      </Typography>
      <Box className={styles.leadMeta}>
        <Box>
          <Typography component="span">증가율</Typography>
          <Typography component="strong">{formatMomentum(tag.momentumPercent)}</Typography>
        </Box>
        <Box>
          <Typography component="span">주요 출처</Typography>
          <Typography component="strong">{tag.topSites[0]?.siteLabel ?? '집계 중'}</Typography>
        </Box>
      </Box>
      {!!tag.relatedTags.length && (
        <Typography component="p" className={styles.relatedTags}>
          함께 등장한 말{' '}
          {tag.relatedTags
            .slice(0, 3)
            .map((item) => `#${item}`)
            .join(' · ')}
        </Typography>
      )}
    </Box>
  );
}

function StatsBand({
  isLoading,
  totalPosts,
  totalTags,
  tagAssignments,
  sourceCount,
}: {
  isLoading: boolean;
  totalPosts?: number;
  totalTags?: number;
  tagAssignments: number;
  sourceCount: number;
}) {
  const stats = [
    { label: 'AI 분석 게시물', value: totalPosts },
    { label: '고유 AI 태그', value: totalTags },
    { label: '태그 연결', value: tagAssignments },
    { label: '확인된 출처', value: sourceCount },
  ];

  return (
    <Box className={styles.statsBand}>
      {stats.map((stat) => (
        <Box key={stat.label} className={styles.stat}>
          <Typography component="span">{stat.label}</Typography>
          {isLoading ? (
            <Skeleton width={80} height={46} />
          ) : (
            <Typography component="strong">{formatCount(stat.value)}</Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}

function SectionHeading({
  index,
  eyebrow,
  title,
  description,
  actionHref,
  actionLabel,
}: {
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
}) {
  return (
    <Box className={styles.sectionHeading}>
      <Typography component="span" className={styles.sectionIndex}>
        {index}
      </Typography>
      <Box className={styles.sectionCopy}>
        <Typography component="p" className={styles.eyebrow}>
          {eyebrow}
        </Typography>
        <Typography component="h2">{title}</Typography>
        <Typography component="p">{description}</Typography>
      </Box>
      <Button component={Link} href={actionHref} endIcon={<EastRoundedIcon />}>
        {actionLabel}
      </Button>
    </Box>
  );
}

function TopStoriesShowcase({
  posts,
  activeRank,
  activePost,
  isLoading,
  isError,
  onRankSelect,
}: {
  posts: BoardPost[];
  activeRank: number;
  activePost?: BoardPost;
  isLoading: boolean;
  isError: boolean;
  onRankSelect: (rank: number) => void;
}) {
  if (isLoading && !posts.length) {
    return (
      <Box className={styles.storiesLoading} aria-label="오늘의 Top 10을 불러오는 중">
        <Box>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} height={76} />
          ))}
        </Box>
        <Skeleton variant="rectangular" height={520} />
      </Box>
    );
  }

  if (isError && !posts.length) {
    return (
      <Alert severity="warning" className={styles.storiesAlert}>
        오늘의 인기 순위를 불러오지 못했습니다. 실시간 게시판은 계속 이용할 수 있습니다.
      </Alert>
    );
  }

  if (!activePost) {
    return (
      <Box className={styles.storiesEmpty}>
        <Typography component="strong">오늘의 순위를 집계하고 있습니다.</Typography>
        <Typography component="p">반응이 모이면 인기 글을 이곳에 차례로 보여드립니다.</Typography>
        <Button component={Link} href="/board">
          실시간 게시판 보기
        </Button>
      </Box>
    );
  }

  return (
    <Box className={styles.storiesGrid}>
      <Box className={styles.rankList} role="tablist" aria-label="오늘의 인기 순위 선택">
        {posts.map((post, index) => {
          const selected = index === activeRank;

          return (
            <ButtonBase
              key={post.Id || `${post.site}-${post.no}`}
              role="tab"
              id={`home-rank-tab-${index + 1}`}
              aria-selected={selected}
              aria-controls="home-top-story-panel"
              onClick={() => onRankSelect(index)}
              className={`${styles.rankItem} ${selected ? styles.rankItemSelected : ''}`}
            >
              <Typography component="span" className={styles.rankNumber}>
                {String(index + 1).padStart(2, '0')}
              </Typography>
              <Box className={styles.rankCopy}>
                <Typography component="span">{post.siteLabel}</Typography>
                <Typography component="strong">{post.title}</Typography>
              </Box>
              <EastRoundedIcon />
            </ButtonBase>
          );
        })}
      </Box>

      <Box
        id="home-top-story-panel"
        role="tabpanel"
        aria-labelledby={`home-rank-tab-${activeRank + 1}`}
        className={styles.storyPanel}
      >
        <StoryMedia post={activePost} rank={activeRank} />
        <Box className={styles.storyContent}>
          <Box className={styles.storyByline}>
            <Typography component="span">오늘 {activeRank + 1}위</Typography>
            <Typography component="span">{activePost.siteLabel}</Typography>
          </Box>
          <Typography component="h3">{activePost.title}</Typography>
          {!!activePost.tags?.length && (
            <Box className={styles.storyTags}>
              {activePost.tags.slice(0, 4).map((tag) => (
                <Typography component="span" key={tag}>
                  #{tag}
                </Typography>
              ))}
            </Box>
          )}
          <Typography component="p" className={styles.storySummary}>
            {getPostSummary(activePost) ||
              'AI가 핵심 내용을 정리하고 있습니다. 상세 화면에서 원문과 최신 분석 상태를 확인할 수 있습니다.'}
          </Typography>
          <Box className={styles.storyMetrics}>
            <Box>
              <LocalFireDepartmentRoundedIcon />
              <Typography component="span">
                좋아요 {formatCount(activePost.likeCount ?? activePost.nativeLikeCount)}
              </Typography>
            </Box>
            <Box>
              <ForumRoundedIcon />
              <Typography component="span">
                댓글 {formatCount(activePost.commentCount ?? activePost.nativeCommentCount)}
              </Typography>
            </Box>
            <Box>
              <ScheduleRoundedIcon />
              <Typography component="span">{formatPostTime(activePost.createTime)}</Typography>
            </Box>
          </Box>
          <Button
            component={Link}
            href={`/top10?rank=${activeRank + 1}`}
            className={styles.storyAction}
            endIcon={<ArrowForwardRoundedIcon />}
          >
            {activeRank + 1}위 이야기 자세히 보기
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

function StoryMedia({ post, rank }: { post: BoardPost; rank: number }) {
  const src = resolveThumbnailSrc(post.thumbnail);
  const [failedSrc, setFailedSrc] = useState('');
  const canShowImage = src && src !== failedSrc;
  const tone = STORY_TONES[rank % STORY_TONES.length];

  return (
    <Box className={`${styles.storyMedia} ${styles[tone]}`}>
      {canShowImage ? (
        <Box
          component="img"
          src={src}
          alt=""
          onError={() => setFailedSrc(src)}
          className={styles.storyImage}
        />
      ) : (
        <Box className={styles.storyFallback} aria-hidden="true">
          <Typography component="span">{String(rank + 1).padStart(2, '0')}</Typography>
          <Typography component="strong">TODAY&apos;S READ</Typography>
        </Box>
      )}
      <Typography component="span" className={styles.mediaSource}>
        {post.siteLabel}
      </Typography>
    </Box>
  );
}

function getSourceLabels(tags: IssueTag[]) {
  const labels = new Set<string>();
  tags.forEach((tag) => tag.topSites.forEach((site) => labels.add(site.siteLabel)));
  return Array.from(labels);
}

function formatCount(value?: number | null) {
  if (value == null) {
    return '0';
  }

  return new Intl.NumberFormat('ko-KR').format(value);
}

function formatGeneratedAt(value?: string) {
  if (!value) {
    return 'AI 태그 자동 집계';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'AI 태그 자동 집계';
  }

  return `${new Intl.DateTimeFormat('ko-KR', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul',
  }).format(date)} 기준`;
}

function formatPostTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '시간 정보 없음';
  }

  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(date);
}

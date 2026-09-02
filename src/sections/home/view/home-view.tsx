'use client';

import type { CSSProperties } from 'react';
import type { BoardPost, IssueCategory } from 'src/api/board-api';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import EastRoundedIcon from '@mui/icons-material/EastRounded';
import ForumRoundedIcon from '@mui/icons-material/ForumRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Skeleton,
  Container,
  Typography,
  ButtonBase,
} from '@mui/material';

import { useTopBoards } from 'src/hooks/use-top-boards';
import { useIssueOverview } from 'src/hooks/use-issue-overview';

import { formatCategory, IssuePulseField, getIssueMomentumAccent } from 'src/components/issues';
import { getPostSummary, resolveThumbnailSrc } from 'src/components/board-post/board-post-utils';

// CSS modules stay after application imports to satisfy the repository import groups.
// eslint-disable-next-line perfectionist/sort-imports
import styles from './home-view.module.css';

const HERO_ACCENTS = ['#AB9FF2', '#4A87F2', '#2EC08B', '#FFD13F', '#FFDADC'];
const FALLBACK_SIGNALS = [
  '실시간 이슈',
  '오늘의 TOP 10',
  'AI 한눈 요약',
  '커뮤니티 흐름',
  '반응 속도',
  '지금의 분위기',
];
const FALLBACK_SOURCES = ['실시간 커뮤니티', '24시간 이슈', 'AI 요약', '오늘의 TOP 10'];

type HeroSignalStyle = CSSProperties & {
  '--hero-signal-color': string;
  '--hero-signal-delay': string;
};

export function HomeView() {
  const router = useRouter();
  const issueOverviewQuery = useIssueOverview();
  const topBoardsQuery = useTopBoards();
  const [selectedRank, setSelectedRank] = useState(0);
  const issues = issueOverviewQuery.data?.categories ?? [];
  const topBoards = topBoardsQuery.data ?? [];
  const activeRank = topBoards[selectedRank] ? selectedRank : 0;
  const activePost = topBoards[activeRank];
  const sourceLabels = getSourceLabels(issues);

  const handleCategorySelect = (category: string | undefined) => {
    if (!category) {
      return;
    }

    const query = new URLSearchParams({ category });
    router.push(`/board?${query.toString()}`);
  };

  return (
    <Box className={styles.home}>
      <Container maxWidth={false} disableGutters className={styles.page}>
        <Hero
          issues={issues}
          totalPosts={issueOverviewQuery.data?.totalPosts}
          totalCategories={issueOverviewQuery.data?.totalCategories}
          isLoading={issueOverviewQuery.isPending}
        />

        <Box component="section" id="live-issues" className={styles.section}>
          <SectionHeading
            eyebrow="LIVE PULSE"
            title="지금, 이야기가 살아 움직이는 곳"
            description="사각형 지도 대신 영향력이 크고 작은 신호들을 한 필드에 띄웠습니다. 맥박이 빠르고 색이 선명할수록 지금 더 빠르게 커지는 이야기입니다."
            action={
              <Button
                component={Link}
                href="/board"
                className={styles.textAction}
                endIcon={<EastRoundedIcon />}
              >
                전체 게시판
              </Button>
            }
          />

          <Box className={styles.issueFieldFrame}>
            <IssuePulseField
              variant="showcase"
              overview={issueOverviewQuery.data}
              isLoading={issueOverviewQuery.isPending}
              isError={issueOverviewQuery.isError}
              onCategorySelect={handleCategorySelect}
            />
          </Box>
        </Box>

        <SourceTicker labels={sourceLabels} />

        <Box component="section" id="top-stories" className={styles.section}>
          <SectionHeading
            eyebrow="TODAY'S TOP 10"
            title="오늘 가장 오래 머문 이야기"
            description="순위를 고르면 핵심 내용과 반응을 바로 미리 볼 수 있습니다. 궁금한 이야기만 깊게 들어가세요."
            action={
              <Button
                component={Link}
                href="/top10/"
                className={styles.textAction}
                endIcon={<EastRoundedIcon />}
              >
                TOP 10 전체보기
              </Button>
            }
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

        <Box component="section" className={styles.featuresSection}>
          <Box className={`${styles.featureCard} ${styles.featurePurple}`}>
            <Stack className={styles.featureTopline} direction="row">
              <BoltRoundedIcon />
              <Typography component="span">LIVE</Typography>
            </Stack>
            <Box>
              <Typography component="h2">흐름부터 보고</Typography>
              <Typography component="p">
                여러 커뮤니티를 돌아다니지 않아도 지금 커지는 카테고리를 먼저 발견합니다.
              </Typography>
            </Box>
            <Button component="a" href="#live-issues" className={styles.featureLink}>
              이슈 맵 보기
            </Button>
          </Box>

          <Box className={`${styles.featureCard} ${styles.featureYellow}`}>
            <Stack className={styles.featureTopline} direction="row">
              <AutoAwesomeRoundedIcon />
              <Typography component="span">AI SUMMARY</Typography>
            </Stack>
            <Box>
              <Typography component="h2">핵심만 펼치고</Typography>
              <Typography component="p">
                제목을 누르면 요약이 먼저 열립니다. 긴 원문은 필요한 순간에만 확인하세요.
              </Typography>
            </Box>
            <Button component={Link} href="/board" className={styles.featureLink}>
              실시간 글 보기
            </Button>
          </Box>

          <Box className={`${styles.featureCard} ${styles.featureBlue}`}>
            <Stack className={styles.featureTopline} direction="row">
              <ForumRoundedIcon />
              <Typography component="span">COMMUNITY</Typography>
            </Stack>
            <Box>
              <Typography component="h2">반응까지 이어서</Typography>
              <Typography component="p">
                좋아요와 댓글을 같은 흐름에서 확인하고, 관심 있는 이야기의 온도를 읽습니다.
              </Typography>
            </Box>
            <Button component={Link} href="/top10/" className={styles.featureLink}>
              인기 순위 보기
            </Button>
          </Box>
        </Box>

        <Box component="section" className={styles.finalCta}>
          <Box className={styles.finalGlow} aria-hidden="true" />
          <Stack className={styles.finalContent} spacing={3}>
            <Typography component="p">오늘의 커뮤니티가 한곳에</Typography>
            <Typography component="h2">
              놓치기 전에,
              <br /> 지금 흐름에 올라타세요.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.25}>
              <Button
                component={Link}
                href="/board"
                className={styles.finalPrimary}
                endIcon={<ArrowForwardRoundedIcon />}
              >
                실시간 게시판 시작
              </Button>
              <Button component={Link} href="/top10/" className={styles.finalSecondary}>
                오늘의 TOP 10
              </Button>
            </Stack>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}

function Hero({
  issues,
  totalPosts,
  totalCategories,
  isLoading,
}: {
  issues: IssueCategory[];
  totalPosts?: number;
  totalCategories?: number;
  isLoading: boolean;
}) {
  return (
    <Box component="section" className={styles.hero}>
      <HeroSignals issues={issues} />
      <Stack className={styles.heroContent} spacing={{ xs: 2.25, md: 3 }}>
        <Stack direction="row" className={styles.livePill}>
          <Box component="span" className={styles.liveDot} />
          <Typography component="span">24시간 커뮤니티 라이브</Typography>
        </Stack>

        <Box>
          <Typography component="p" className={styles.heroKicker}>
            세상의 모든 커뮤니티,
            <br /> 한눈에 흐르도록
          </Typography>
          <Typography component="h1" className={styles.heroTitle}>
            지금 뜨는 이야기를
            <br /> 가장 먼저 만나세요
          </Typography>
        </Box>

        <Typography component="p" className={styles.heroDescription}>
          흩어진 게시물의 흐름을 모으고, AI 요약과 반응을 연결했습니다.
          <br className={styles.desktopBreak} /> 스크롤할수록 오늘의 분위기가 선명해집니다.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.25}
          className={styles.heroActions}
        >
          <Button
            component="a"
            href="#live-issues"
            className={styles.heroPrimary}
            endIcon={<ArrowForwardRoundedIcon />}
          >
            라이브 신호 보기
          </Button>
          <Button component={Link} href="/board" className={styles.heroSecondary}>
            실시간 게시판
          </Button>
        </Stack>
      </Stack>

      <Box className={styles.heroStats}>
        <HeroStat
          label="최근 24시간 게시물"
          value={isLoading ? undefined : formatCount(totalPosts)}
        />
        <HeroStat
          label="활성 카테고리"
          value={isLoading ? undefined : formatCount(totalCategories)}
        />
        <HeroStat label="흐름 업데이트" value="LIVE" live />
      </Box>
    </Box>
  );
}

function HeroSignals({ issues }: { issues: IssueCategory[] }) {
  const signals = issues.length
    ? issues.slice(0, 6).map((issue) => ({
        label: formatCategory(issue.category),
        momentum: formatMomentum(issue.momentumPercent),
        count: `${formatCount(issue.postCount)} posts`,
        color: getIssueMomentumAccent(issue.momentumPercent),
      }))
    : FALLBACK_SIGNALS.map((label, index) => ({
        label,
        momentum: 'NOW',
        count: 'LIVE SIGNAL',
        color: HERO_ACCENTS[index % HERO_ACCENTS.length],
      }));

  return (
    <Box className={styles.heroSignals} aria-hidden="true">
      {signals.map((signal, index) => (
        <Box
          key={signal.label}
          className={styles.heroSignal}
          style={
            {
              '--hero-signal-color': signal.color,
              '--hero-signal-delay': `${index * -1.25}s`,
            } as HeroSignalStyle
          }
        >
          <Typography component="span">{signal.label}</Typography>
          <Typography component="strong">{signal.momentum}</Typography>
          <Typography component="em">{signal.count}</Typography>
        </Box>
      ))}
    </Box>
  );
}

function HeroStat({
  label,
  value,
  live = false,
}: {
  label: string;
  value?: string;
  live?: boolean;
}) {
  return (
    <Box className={styles.heroStat}>
      {value ? (
        <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
          {live && <Box component="span" className={styles.statDot} />}
          <Typography component="strong">{value}</Typography>
        </Stack>
      ) : (
        <Skeleton width={76} height={34} sx={{ bgcolor: 'rgba(255,255,255,.14)' }} />
      )}
      <Typography component="span">{label}</Typography>
    </Box>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action: React.ReactNode;
}) {
  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} className={styles.sectionHeading}>
      <Box>
        <Typography component="p" className={styles.sectionEyebrow}>
          {eyebrow}
        </Typography>
        <Typography component="h2">{title}</Typography>
        <Typography component="p" className={styles.sectionDescription}>
          {description}
        </Typography>
      </Box>
      {action}
    </Stack>
  );
}

function SourceTicker({ labels }: { labels: string[] }) {
  const tickerLabels = labels.length ? labels : FALLBACK_SOURCES;

  return (
    <Box className={styles.ticker} aria-label="현재 수집 중인 주요 출처">
      <Box className={styles.tickerTrack}>
        {[...tickerLabels, ...tickerLabels].map((label, index) => (
          <Stack
            // The repeated second set keeps the ticker visually continuous.
            key={`${label}-${index}`}
            direction="row"
            className={styles.tickerItem}
            aria-hidden={index >= tickerLabels.length ? 'true' : undefined}
          >
            <Box component="span" />
            <Typography component="strong">{label}</Typography>
          </Stack>
        ))}
      </Box>
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
      <Box className={styles.topStoriesLoading} aria-label="오늘의 Top 10을 불러오는 중">
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rounded" height={72} />
          ))}
        </Stack>
        <Skeleton variant="rounded" height={460} />
      </Box>
    );
  }

  if (isError && !posts.length) {
    return (
      <Alert severity="warning" className={styles.topStoriesAlert}>
        오늘의 인기 순위를 불러오지 못했습니다. 실시간 게시판은 계속 둘러볼 수 있습니다.
      </Alert>
    );
  }

  if (!activePost) {
    return (
      <Box className={styles.topStoriesEmpty}>
        <EmojiEventsRoundedIcon />
        <Typography component="h3">오늘의 순위를 집계하고 있습니다.</Typography>
        <Typography component="p">새로운 반응이 모이면 이곳에서 가장 먼저 보여드릴게요.</Typography>
        <Button component={Link} href="/board" className={styles.softButton}>
          실시간 게시판 보기
        </Button>
      </Box>
    );
  }

  return (
    <Box className={styles.topStoriesGrid}>
      <Box className={styles.rankRail} role="tablist" aria-label="오늘의 인기 순위 선택">
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
        <Stack className={styles.storyContent} spacing={2}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <Chip label={`오늘 ${activeRank + 1}위`} className={styles.rankChip} />
            <Chip label={activePost.siteLabel} className={styles.sourceChip} />
            {activePost.tags
              ?.slice(0, 2)
              .map((tag) => <Chip key={tag} label={`#${tag}`} className={styles.sourceChip} />)}
          </Stack>
          <Typography component="h3">{activePost.title}</Typography>
          <Typography component="p" className={styles.storySummary}>
            {getPostSummary(activePost) ||
              'AI가 핵심 내용을 정리하고 있습니다. 상세 화면에서 원문과 최신 반응을 먼저 확인할 수 있어요.'}
          </Typography>
          <Stack direction="row" spacing={2.5} className={styles.storyMetrics}>
            <Stack direction="row" spacing={0.75}>
              <LocalFireDepartmentRoundedIcon />
              <Typography component="span">
                좋아요 {formatCount(activePost.likeCount ?? activePost.nativeLikeCount)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.75}>
              <ForumRoundedIcon />
              <Typography component="span">
                댓글 {formatCount(activePost.commentCount ?? activePost.nativeCommentCount)}
              </Typography>
            </Stack>
          </Stack>
          <Button
            component={Link}
            href={`/top10/?rank=${activeRank + 1}`}
            className={styles.storyAction}
            endIcon={<ArrowForwardRoundedIcon />}
          >
            {activeRank + 1}위 이야기 자세히 보기
          </Button>
        </Stack>
      </Box>
    </Box>
  );
}

function StoryMedia({ post, rank }: { post: BoardPost; rank: number }) {
  const src = resolveThumbnailSrc(post.thumbnail);
  const [failedSrc, setFailedSrc] = useState('');
  const canShowImage = src && src !== failedSrc;

  return (
    <Box
      className={styles.storyMedia}
      style={{ backgroundColor: HERO_ACCENTS[rank % HERO_ACCENTS.length] }}
    >
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
          <LocalFireDepartmentRoundedIcon />
        </Box>
      )}
      <Box className={styles.storyMediaShade} />
      <Typography component="span" className={styles.storyMediaLabel}>
        TRENDING NOW
      </Typography>
    </Box>
  );
}

function getSourceLabels(issues: IssueCategory[]) {
  const labels = new Set<string>();

  issues.forEach((issue) => {
    issue.topSites.forEach((site) => labels.add(site.siteLabel));
  });

  return Array.from(labels).slice(0, 8);
}

function formatCount(value?: number | null) {
  if (value == null) {
    return '0';
  }

  return new Intl.NumberFormat('ko-KR', { notation: 'compact' }).format(value);
}

function formatMomentum(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

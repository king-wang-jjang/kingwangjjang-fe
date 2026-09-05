'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter } from 'next/navigation';

import { Box, Button, Typography } from '@mui/material';
import EastRoundedIcon from '@mui/icons-material/EastRounded';

import { useTopBoards } from 'src/hooks/use-top-boards';
import { useIssueOverview } from 'src/hooks/use-issue-overview';

import { ActivityStory } from '../activity/activity-story';
import { adaptActivityData } from '../activity/activity-data';
import { TrendingPostFeed } from '../activity/trending-post-feed';
import { CrossCommunityStory } from '../activity/cross-community-story';

// CSS modules stay after application imports to satisfy the repository import groups.
// eslint-disable-next-line perfectionist/sort-imports
import styles from './home-view.module.css';

export function HomeView() {
  const router = useRouter();
  const issueOverviewQuery = useIssueOverview();
  const topBoardsQuery = useTopBoards();
  const topBoards = useMemo(() => topBoardsQuery.data ?? [], [topBoardsQuery.data]);
  const activityData = useMemo(
    () =>
      issueOverviewQuery.data ? adaptActivityData(issueOverviewQuery.data, topBoards) : undefined,
    [issueOverviewQuery.data, topBoards]
  );

  const handleTopicSelect = (tag: string) => {
    const query = new URLSearchParams({ tag });
    router.push(`/board?${query.toString()}`);
  };

  return (
    <Box className={styles.home}>
      <ActivityStory
        data={activityData}
        isLoading={issueOverviewQuery.isPending}
        isError={issueOverviewQuery.isError}
        onTopicSelect={handleTopicSelect}
      />

      <CrossCommunityStory
        topic={issueOverviewQuery.isPending ? undefined : (activityData?.topics[0] ?? null)}
        windowHours={activityData?.windowHours}
        generatedAt={activityData?.generatedAt}
      />

      <Box id="popular-feed" className={styles.feedAnchor}>
        <TrendingPostFeed
          posts={topBoards}
          isLoading={topBoardsQuery.isPending}
          isError={topBoardsQuery.isError}
          featuredTag={activityData?.topics[0]?.label}
        />
      </Box>

      <Box component="footer" className={styles.footer}>
        <Box>
          <Typography component="p">마약.kr / COMMUNITY DATA</Typography>
          <Typography component="h2">
            커뮤니티 게시글
            <br /> 수집·요약·태그 통계
          </Typography>
        </Box>
        <Box className={styles.footerMeta}>
          <Typography component="p">
            화면의 Activity Score는 최근 응답 안에서 비교한 상대 지표입니다. 사회적 중요도나 여론
            전체를 의미하지 않습니다.
          </Typography>
          <Button component={Link} href="/board" endIcon={<EastRoundedIcon />}>
            실시간 게시판으로
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import useMediaQuery from '@mui/material/useMediaQuery';

import { useTopBoards } from 'src/hooks/use-top-boards';
import { useIssueOverview } from 'src/hooks/use-issue-overview';

import { AsciiFlow } from '../activity/ascii-flow';
import { ActivityStory } from '../activity/activity-story';
import { adaptActivityData } from '../activity/activity-data';
import { TrendingPostFeed } from '../activity/trending-post-feed';

// CSS modules stay after application imports to satisfy the repository import groups.
// eslint-disable-next-line perfectionist/sort-imports
import styles from './home-view.module.css';

export function HomeView() {
  const router = useRouter();
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [motionPaused, setMotionPaused] = useState(false);
  const motionEnabled = !motionPaused && !prefersReducedMotion;
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
    <div className={styles.home} data-home-motion={motionEnabled ? 'running' : 'paused'}>
      <AsciiFlow variant="ambient" />
      <ActivityStory
        data={activityData}
        isLoading={issueOverviewQuery.isPending}
        isError={issueOverviewQuery.isError}
        onTopicSelect={handleTopicSelect}
        isRefreshing={issueOverviewQuery.isFetching && !issueOverviewQuery.isPending}
        motionEnabled={motionEnabled}
        isMotionReduced={prefersReducedMotion}
        onMotionToggle={() => setMotionPaused((paused) => !paused)}
      >
        <div id="popular-feed" className={styles.feedAnchor}>
          <TrendingPostFeed
            posts={topBoards}
            isLoading={topBoardsQuery.isPending}
            isError={topBoardsQuery.isError}
            featuredTag={activityData?.topics[0]?.label}
            isRefreshing={topBoardsQuery.isFetching && !topBoardsQuery.isPending}
          />
        </div>
      </ActivityStory>

      <footer className={styles.footer}>
        <p className={styles.rule} aria-hidden="true">
          {'-'.repeat(110)}
        </p>
        <p>마약.kr / 커뮤니티 게시글 수집, 요약, 태그 통계</p>
        <p>Activity는 현재 집계 안의 상대 지표이며 사회적 중요도나 전체 여론을 뜻하지 않습니다.</p>
        <Link href="/board">[실시간 게시판 &gt;]</Link>
      </footer>
    </div>
  );
}

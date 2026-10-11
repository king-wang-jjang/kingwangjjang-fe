'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import useMediaQuery from '@mui/material/useMediaQuery';

import { useTopBoards } from 'src/hooks/use-top-boards';
import { useDailyIssueBriefing } from 'src/hooks/use-daily-issue-briefing';

import { AsciiShapes } from '../activity/ascii-shapes';
import { ActivityStory } from '../activity/activity-story';
import { TrendingPostFeed } from '../activity/trending-post-feed';

// CSS modules stay after application imports to satisfy the repository import groups.
// eslint-disable-next-line perfectionist/sort-imports
import styles from './home-view.module.css';

export function HomeView() {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [motionPaused, setMotionPaused] = useState(false);
  const motionEnabled = !motionPaused && !prefersReducedMotion;
  const issueBriefingQuery = useDailyIssueBriefing();
  const topBoardsQuery = useTopBoards();
  const topBoards = useMemo(() => topBoardsQuery.data ?? [], [topBoardsQuery.data]);

  return (
    <div className={styles.home} data-home-motion={motionEnabled ? 'running' : 'paused'}>
      <AsciiShapes motionEnabled={motionEnabled} />
      <ActivityStory
        data={issueBriefingQuery.data}
        isLoading={issueBriefingQuery.isPending}
        isError={issueBriefingQuery.isError}
        isRefreshing={issueBriefingQuery.isFetching && !issueBriefingQuery.isPending}
        motionEnabled={motionEnabled}
        isMotionReduced={prefersReducedMotion}
        onMotionToggle={() => setMotionPaused((paused) => !paused)}
      />

      <div id="popular-feed" className={styles.feedAnchor}>
        <TrendingPostFeed
          posts={topBoards}
          isLoading={topBoardsQuery.isPending}
          isError={topBoardsQuery.isError}
          isRefreshing={topBoardsQuery.isFetching && !topBoardsQuery.isPending}
        />
      </div>

      <footer className={styles.footer}>
        <p className={styles.rule} aria-hidden="true">
          {'. - '.repeat(28)}
        </p>
        <p>마약.kr / 오늘의 사회 이슈와 커뮤니티 게시글 요약</p>
        <nav className={styles.footerLinks} aria-label="전체 게시글 탐색">
          <Link href="/board">[실시간 게시판 &gt;]</Link>
          <Link href="/top10">[Top 10 전체 &gt;]</Link>
        </nav>
      </footer>
    </div>
  );
}

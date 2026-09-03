'use client';

import type { CSSProperties } from 'react';
import type { IssueOverview } from 'src/api/board-api';

import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import { Box, Alert, Skeleton, ButtonBase, Typography } from '@mui/material';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import HorizontalRuleRoundedIcon from '@mui/icons-material/HorizontalRuleRounded';

// CSS modules stay after application imports to satisfy the repository import groups.
// eslint-disable-next-line perfectionist/sort-imports
import styles from './issue-pulse-field.module.css';

type Props = {
  overview?: IssueOverview;
  isLoading?: boolean;
  isError?: boolean;
  selectedTag?: string;
  onTagSelect: (tag: string | undefined) => void;
};

type ImpactStyle = CSSProperties & {
  '--tag-impact': string;
};

const MAX_VISIBLE_TAGS = 12;
const CATEGORY_LABELS: Record<string, string> = {
  dcbest: '디시 인기',
  freeboard: '자유게시판',
  humor: '유머',
  issue: '이슈',
  yeobgi: '엽기·이슈',
  stock: '주식',
  money: '경제·재테크',
  food: '음식',
  tour: '여행',
  car: '자동차',
  problem: '고민·질문',
  watch: '방송·영상',
  youtube_info: '영상 정보',
  toss_shop: '쇼핑',
  pmarket7: '장터',
  'maple-5974': '메이플스토리',
  'lostark-6271': '로스트아크',
  'lol-4625': '리그 오브 레전드',
};

export function TagBriefing({
  overview,
  isLoading = false,
  isError = false,
  selectedTag,
  onTagSelect,
}: Props) {
  if (isLoading) {
    return <TagBriefingSkeleton />;
  }

  if (isError) {
    return (
      <Alert severity="warning" className={styles.alert}>
        AI 태그 통계를 불러오지 못했습니다. 게시판의 글은 계속 확인할 수 있습니다.
      </Alert>
    );
  }

  const tags = overview?.tags.slice(0, MAX_VISIBLE_TAGS) ?? [];

  if (!tags.length) {
    return (
      <Box className={styles.empty}>
        <Typography component="strong">아직 집계할 AI 태그가 없습니다.</Typography>
        <Typography component="p">
          분석이 완료된 게시물에 태그가 생성되면 이곳에 자동으로 반영됩니다.
        </Typography>
      </Box>
    );
  }

  const maxImpact = Math.max(...tags.map((tag) => tag.impactScore), 1);

  return (
    <Box className={styles.table}>
      <Box className={styles.tableHead} aria-hidden="true">
        <span>태그</span>
        <span>분석 글</span>
        <span>주요 출처</span>
        <span>증가율</span>
        <span>영향도</span>
      </Box>

      <Box className={styles.rows}>
        {tags.map((tag, index) => {
          const selected = selectedTag === tag.tag;
          const impactPercent = Math.max(4, (tag.impactScore / maxImpact) * 100);

          return (
            <ButtonBase
              key={tag.tag}
              data-tag={tag.tag}
              aria-pressed={selected}
              className={`${styles.row} ${selected ? styles.selected : ''}`}
              onClick={() => onTagSelect(selected ? undefined : tag.tag)}
              style={{ '--tag-impact': `${impactPercent}%` } as ImpactStyle}
            >
              <Box className={styles.tagCell}>
                <Typography component="span" className={styles.rank}>
                  {String(index + 1).padStart(2, '0')}
                </Typography>
                <Box className={styles.tagCopy}>
                  <Typography component="strong">#{tag.tag}</Typography>
                  <Typography component="span">{formatRelatedTags(tag.relatedTags)}</Typography>
                </Box>
              </Box>

              <Typography component="span" className={styles.countCell}>
                <strong>{formatCount(tag.postCount)}</strong>건
              </Typography>

              <Typography component="span" className={styles.sourceCell}>
                {tag.topSites[0]?.siteLabel ?? '출처 집계 중'}
              </Typography>

              <Box className={styles.momentumCell}>
                <MomentumIcon value={tag.momentumPercent} />
                <Typography component="span">{formatMomentum(tag.momentumPercent)}</Typography>
              </Box>

              <Box className={styles.impactCell}>
                <Box className={styles.impactTrack}>
                  <Box component="span" />
                </Box>
                <Typography component="span">{Math.round(tag.share * 100)}%</Typography>
              </Box>
            </ButtonBase>
          );
        })}
      </Box>
    </Box>
  );
}

function TagBriefingSkeleton() {
  return (
    <Box className={styles.table} aria-label="AI 태그 통계를 불러오는 중">
      <Box className={styles.tableHead} aria-hidden="true">
        <span>태그</span>
        <span>분석 글</span>
        <span>주요 출처</span>
        <span>증가율</span>
        <span>영향도</span>
      </Box>
      <Box className={styles.rows}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Box key={index} className={styles.skeletonRow}>
            <Skeleton width="58%" />
            <Skeleton width="44%" />
            <Skeleton width="64%" />
            <Skeleton width="48%" />
            <Skeleton width="90%" />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

function MomentumIcon({ value }: { value: number }) {
  if (value > 0) {
    return <TrendingUpRoundedIcon aria-hidden="true" />;
  }

  if (value < 0) {
    return <TrendingDownRoundedIcon aria-hidden="true" />;
  }

  return <HorizontalRuleRoundedIcon aria-hidden="true" />;
}

function formatRelatedTags(tags: string[]) {
  if (!tags.length) {
    return '연관 태그 집계 중';
  }

  return tags
    .slice(0, 2)
    .map((tag) => `#${tag}`)
    .join(' · ');
}

function formatCount(value: number) {
  return new Intl.NumberFormat('ko-KR').format(value);
}

export function formatMomentum(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

export function formatCategory(category: string) {
  const knownLabel = CATEGORY_LABELS[category];
  if (knownLabel) {
    return knownLabel;
  }

  return category
    .replace(/-\d+$/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

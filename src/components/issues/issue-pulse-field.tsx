'use client';

import type { PointerEvent, CSSProperties } from 'react';
import type { IssueCategory, IssueOverview } from 'src/api/board-api';

import { scaleThreshold } from 'd3-scale';
import { pack, hierarchy } from 'd3-hierarchy';
import { useRef, useMemo, useState, useEffect } from 'react';

import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import {
  Box,
  Card,
  Stack,
  Alert,
  Tooltip,
  Skeleton,
  Typography,
  ButtonBase,
  CardContent,
} from '@mui/material';

// CSS modules stay after application imports to satisfy the repository import groups.
// eslint-disable-next-line perfectionist/sort-imports
import styles from './issue-pulse-field.module.css';

type Props = {
  overview?: IssueOverview;
  isLoading?: boolean;
  isError?: boolean;
  variant?: 'default' | 'showcase';
  selectedCategory?: string;
  onCategorySelect: (category: string | undefined) => void;
};

type PulseDatum = {
  name: string;
  value?: number;
  issue?: IssueCategory;
  children?: PulseDatum[];
};

type SignalStyle = CSSProperties & {
  '--drift-x': string;
  '--drift-y': string;
  '--signal-color': string;
  '--signal-delay': string;
  '--signal-duration': string;
  '--signal-pulse': string;
};

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

const MAX_SIGNALS = 14;
const MOMENTUM_COLOR_SCALE = scaleThreshold<number, string>()
  .domain([-1, 35, 120])
  .range(['#4a87f2', '#ab9ff2', '#c7ff6b', '#ff79c6']);

export function IssuePulseField({
  overview,
  isLoading = false,
  isError = false,
  variant = 'default',
  selectedCategory,
  onCategorySelect,
}: Props) {
  const showcase = variant === 'showcase';
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(0);

  useEffect(() => {
    const element = chartRef.current;
    if (!element) {
      return undefined;
    }

    const updateWidth = () => {
      const nextWidth = Math.round(element.getBoundingClientRect().width);
      if (nextWidth > 0) {
        setChartWidth(nextWidth);
      }
    };

    updateWidth();
    if (typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, [overview?.categories.length]);

  const layoutWidth = Math.max(chartWidth, 1);
  const chartHeight = layoutWidth < 560 ? 560 : layoutWidth < 900 ? 520 : 540;
  const signals = useMemo(() => {
    if (!overview?.categories.length) {
      return [];
    }

    const categories = [...overview.categories]
      .sort((left, right) => right.impactScore - left.impactScore)
      .slice(0, MAX_SIGNALS);
    const data: PulseDatum = {
      name: 'signals',
      children: categories.map((issue) => ({
        name: issue.category,
        value: Math.max(issue.impactScore, 0.01),
        issue,
      })),
    };
    const root = hierarchy(data)
      .sum((item) => item.value ?? 0)
      .sort((left, right) => (right.value ?? 0) - (left.value ?? 0));

    const packedSignals = pack<PulseDatum>()
      .size([layoutWidth, chartHeight])
      .padding(12)(root)
      .leaves();
    const horizontalSpread = Math.min(1.9, Math.max(1, (layoutWidth / chartHeight) * 0.88));
    const centerX = layoutWidth / 2;
    const edgePadding = layoutWidth < 560 ? 12 : 18;

    packedSignals.forEach((signal) => {
      const spreadX = centerX + (signal.x - centerX) * horizontalSpread;
      signal.x = Math.min(
        layoutWidth - signal.r - edgePadding,
        Math.max(signal.r + edgePadding, spreadX)
      );
      signal.y = Math.min(
        chartHeight - signal.r - edgePadding,
        Math.max(signal.r + edgePadding, signal.y)
      );
    });

    return packedSignals;
  }, [chartHeight, layoutWidth, overview]);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'touch') {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    event.currentTarget.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.setProperty('--pointer-x', '50%');
    event.currentTarget.style.setProperty('--pointer-y', '50%');
  };

  const mutedColor = showcase ? 'rgba(255, 253, 248, 0.64)' : 'text.secondary';

  return (
    <Card
      className={`${styles.card} ${showcase ? styles.showcase : ''}`}
      sx={{
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        color: showcase ? '#fffdf8' : 'text.primary',
        bgcolor: showcase ? '#15101f' : 'background.paper',
        border: showcase ? 0 : 1,
        borderColor: showcase ? 'transparent' : 'divider',
        borderRadius: showcase ? 6 : 2,
        boxShadow: 'none',
      }}
    >
      <CardContent
        sx={{
          p: showcase ? { xs: 2, sm: 3, md: 4 } : { xs: 1.5, sm: 2 },
          '&:last-child': { pb: showcase ? { xs: 2, sm: 3, md: 4 } : 2 },
        }}
      >
        <Stack spacing={{ xs: 2, md: 2.5 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            sx={{
              alignItems: { xs: 'flex-start', md: 'flex-end' },
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Box className={styles.liveBadge}>
                  <Box component="span" />
                  LIVE
                </Box>
                <SensorsRoundedIcon sx={{ color: '#ab9ff2', fontSize: 22 }} />
              </Stack>
              <Typography
                component="h3"
                sx={{ mt: 1.25, fontSize: { xs: '1.5rem', md: '2rem' }, fontWeight: 550 }}
              >
                실시간 시그널 필드
              </Typography>
              <Typography sx={{ mt: 0.75, maxWidth: 680, color: mutedColor, lineHeight: 1.65 }}>
                이야기의 영향력은 크기로, 상승 속도는 색과 맥박으로 표시합니다. 신호를 누르면 해당
                카테고리의 글로 이동합니다.
              </Typography>
            </Box>

            {!!overview && (
              <Stack direction="row" spacing={2.5} className={styles.summary}>
                <Box>
                  <Typography component="strong">
                    {overview.totalPosts.toLocaleString('ko-KR')}
                  </Typography>
                  <Typography component="span">게시물</Typography>
                </Box>
                <Box>
                  <Typography component="strong">
                    {overview.totalCategories.toLocaleString('ko-KR')}
                  </Typography>
                  <Typography component="span">활성 신호</Typography>
                </Box>
              </Stack>
            )}
          </Stack>

          <Stack direction="row" spacing={1.5} useFlexGap className={styles.legend}>
            <LegendDot color="#4a87f2" label="잠시 쉬어가는 중" />
            <LegendDot color="#ab9ff2" label="꾸준한 흐름" />
            <LegendDot color="#c7ff6b" label="빠른 상승" />
            <LegendDot color="#ff79c6" label="폭발적 상승" />
            <Typography component="span">버블 크기 = 영향력</Typography>
          </Stack>

          {isLoading && !overview && <PulseFieldSkeleton height={chartHeight} />}

          {isError && !overview && (
            <Alert severity="warning" className={styles.alert}>
              이슈 신호를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
            </Alert>
          )}

          {!isLoading && !isError && overview && !overview.categories.length && (
            <Box className={styles.empty}>
              <SensorsRoundedIcon />
              <Typography component="p">표시할 최근 신호가 없습니다.</Typography>
            </Box>
          )}

          {!!signals.length && (
            <Box
              ref={chartRef}
              data-testid="issue-pulse-field"
              className={styles.field}
              style={{ height: chartHeight }}
              onPointerMove={handlePointerMove}
              onPointerLeave={handlePointerLeave}
            >
              <Box className={styles.fieldGrid} aria-hidden="true" />
              <svg
                className={styles.connections}
                viewBox={`0 0 ${layoutWidth} ${chartHeight}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {signals.slice(1, 9).map((signal, index) => (
                  <line
                    key={signal.data.name}
                    x1={signals[0].x}
                    y1={signals[0].y}
                    x2={signal.x}
                    y2={signal.y}
                    style={{ animationDelay: `${index * -0.8}s` }}
                  />
                ))}
              </svg>

              {signals.map((signal, index) => {
                const { issue } = signal.data;
                if (!issue) {
                  return null;
                }

                const diameter = signal.r * 2;
                const selected = issue.category === selectedCategory;
                const size = diameter < 76 ? 'small' : diameter < 132 ? 'medium' : 'large';
                const color = getIssueMomentumAccent(issue.momentumPercent);
                const style: SignalStyle = {
                  left: signal.x - signal.r,
                  top: signal.y - signal.r,
                  width: diameter,
                  height: diameter,
                  '--drift-x': `${((index % 3) - 1) * (6 + (index % 4) * 2)}px`,
                  '--drift-y': `${(index % 2 ? -1 : 1) * (7 + (index % 5))}px`,
                  '--signal-color': color,
                  '--signal-delay': `${index * -0.73}s`,
                  '--signal-duration': `${7.5 + (index % 5) * 0.9}s`,
                  '--signal-pulse': `${getPulseDuration(issue.momentumPercent)}s`,
                };

                return (
                  <Box key={issue.category} className={styles.signalMotion} style={style}>
                    <Tooltip arrow placement="top" title={<IssueTooltip issue={issue} />}>
                      <ButtonBase
                        type="button"
                        data-category={issue.category}
                        data-size={size}
                        aria-pressed={selected}
                        aria-label={`${formatCategory(issue.category)}, 게시물 ${issue.postCount}개, 상승률 ${formatMomentum(issue.momentumPercent)}`}
                        className={`${styles.signal} ${selected ? styles.signalSelected : ''}`}
                        onClick={() => onCategorySelect(selected ? undefined : issue.category)}
                      >
                        <Box className={styles.signalRing} aria-hidden="true" />
                        <Box className={styles.signalOrbit} aria-hidden="true">
                          <Box component="span" />
                        </Box>
                        <Typography component="span" className={styles.signalLabel}>
                          {formatCategory(issue.category)}
                        </Typography>
                        {size !== 'small' && (
                          <Typography component="span" className={styles.signalCount}>
                            {issue.postCount.toLocaleString('ko-KR')} posts
                          </Typography>
                        )}
                        <Stack direction="row" spacing={0.375} className={styles.signalMomentum}>
                          {issue.momentumPercent >= 0 ? (
                            <TrendingUpRoundedIcon />
                          ) : (
                            <TrendingDownRoundedIcon />
                          )}
                          <Typography component="strong">
                            {formatMomentum(issue.momentumPercent)}
                          </Typography>
                        </Stack>
                      </ButtonBase>
                    </Tooltip>
                  </Box>
                );
              })}

              <Typography component="span" className={styles.fieldHint} aria-hidden="true">
                MOVE TO TRACE THE SIGNAL
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
}

function PulseFieldSkeleton({ height }: { height: number }) {
  return (
    <Box className={styles.skeleton} sx={{ height }} aria-label="실시간 신호를 불러오는 중">
      {[34, 22, 17, 12, 9].map((size, index) => (
        <Skeleton
          key={size}
          variant="circular"
          className={styles.skeletonSignal}
          sx={{
            width: `${size}%`,
            height: 'auto',
            aspectRatio: '1',
            left: `${8 + index * 18}%`,
            top: `${12 + ((index * 23) % 52)}%`,
            bgcolor: 'rgba(171, 159, 242, 0.16)',
          }}
        />
      ))}
    </Box>
  );
}

function IssueTooltip({ issue }: { issue: IssueCategory }) {
  return (
    <Stack spacing={0.375} sx={{ py: 0.25 }}>
      <Typography variant="subtitle2" color="inherit">
        {formatCategory(issue.category)}
      </Typography>
      <Typography variant="caption" color="inherit">
        게시물 {issue.postCount}개 · 영향력 {formatImpact(issue.impactScore)}
      </Typography>
      <Typography variant="caption" color="inherit">
        최근 12시간 {issue.currentPosts}개 / 이전 12시간 {issue.previousPosts}개
      </Typography>
      {!!issue.topSites.length && (
        <Typography variant="caption" color="inherit">
          주요 출처: {issue.topSites.map((site) => site.siteLabel).join(', ')}
        </Typography>
      )}
      {!!issue.topTags.length && (
        <Typography variant="caption" color="inherit">
          {issue.topTags.map((tag) => `#${tag}`).join(' ')}
        </Typography>
      )}
    </Stack>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <Stack direction="row" spacing={0.625} sx={{ alignItems: 'center' }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      <Typography component="span">{label}</Typography>
    </Stack>
  );
}

export function formatCategory(category: string) {
  if (CATEGORY_LABELS[category]) {
    return CATEGORY_LABELS[category];
  }

  return category
    .replace(/-\d+$/, '')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/^./, (character) => character.toUpperCase());
}

export function getIssueMomentumAccent(value: number) {
  return MOMENTUM_COLOR_SCALE(value);
}

function getPulseDuration(value: number) {
  const normalized = Math.min(Math.max(value, -100), 300);
  return 4.8 - ((normalized + 100) / 400) * 2.3;
}

function formatMomentum(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

function formatImpact(value: number) {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(value);
}

'use client';

import type { IssueCategory, IssueOverview } from 'src/api/board-api';

import { scaleLinear } from 'd3-scale';
import { useRef, useMemo, useState, useEffect } from 'react';
import { treemap, hierarchy, treemapSquarify } from 'd3-hierarchy';

import { useTheme } from '@mui/material/styles';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import {
  Box,
  Card,
  Chip,
  Stack,
  Alert,
  Tooltip,
  Skeleton,
  Typography,
  CardContent,
} from '@mui/material';


type Props = {
  overview?: IssueOverview;
  isLoading?: boolean;
  isError?: boolean;
  selectedCategory?: string;
  onCategorySelect: (category: string | undefined) => void;
};

type TreemapDatum = {
  name: string;
  value?: number;
  issue?: IssueCategory;
  children?: TreemapDatum[];
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

export function IssueTreemap({
  overview,
  isLoading = false,
  isError = false,
  selectedCategory,
  onCategorySelect,
}: Props) {
  const theme = useTheme();
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [chartWidth, setChartWidth] = useState(960);

  useEffect(() => {
    const element = chartRef.current;
    if (!element || typeof ResizeObserver === 'undefined') {
      return undefined;
    }

    const updateWidth = () => {
      const nextWidth = Math.round(element.getBoundingClientRect().width);
      if (nextWidth > 0) {
        setChartWidth(nextWidth);
      }
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(element);

    return () => observer.disconnect();
  }, [overview?.categories.length]);

  const chartHeight = chartWidth < 560 ? 500 : chartWidth < 900 ? 420 : 360;
  const leaves = useMemo(() => {
    if (!overview?.categories.length) {
      return [];
    }

    const data: TreemapDatum = {
      name: 'issues',
      children: overview.categories.map((issue) => ({
        name: issue.category,
        value: Math.max(issue.impactScore, 0.01),
        issue,
      })),
    };
    const root = hierarchy(data)
      .sum((item) => item.value ?? 0)
      .sort((left, right) => (right.value ?? 0) - (left.value ?? 0));

    return treemap<TreemapDatum>()
      .size([chartWidth, chartHeight])
      .tile(treemapSquarify.ratio(1.25))
      .paddingInner(4)
      .paddingOuter(1)
      .round(true)(root)
      .leaves();
  }, [chartHeight, chartWidth, overview]);

  const momentumColor = useMemo(
    () =>
      scaleLinear<string>()
        .domain([-100, 0, 200])
        .range([theme.palette.info.dark, theme.palette.grey[700], theme.palette.secondary.main])
        .clamp(true),
    [theme]
  );

  return (
    <Card
      className="issue-treemap-card"
      sx={{
        minWidth: 0,
        maxWidth: '100%',
        overflow: 'hidden',
        bgcolor: 'background.paper',
        borderColor: 'divider',
        borderRadius: 1,
      }}
    >
      <CardContent sx={{ p: { xs: 1.25, sm: 1.5 }, '&:last-child': { pb: 1.5 } }}>
        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
          >
            <Box>
              <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
                <InsightsOutlinedIcon color="secondary" fontSize="small" />
                <Typography variant="h6">실시간 이슈 맵</Typography>
                <Chip label="최근 24시간" size="small" variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.375 }}>
                면적은 이슈 영향력, 색은 직전 12시간 대비 상승세를 나타냅니다.
              </Typography>
            </Box>

            {!!overview && (
              <Typography variant="caption" color="text.secondary">
                게시물 {overview.totalPosts.toLocaleString('ko-KR')}개 · 카테고리{' '}
                {overview.totalCategories.toLocaleString('ko-KR')}개
              </Typography>
            )}
          </Stack>

          <Stack direction="row" spacing={1.25} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <LegendDot color={theme.palette.info.dark} label="하락" />
            <LegendDot color={theme.palette.grey[700]} label="유지" />
            <LegendDot color={theme.palette.secondary.main} label="상승" />
            <Typography variant="caption" color="text.secondary">
              카테고리를 누르면 게시물 목록이 필터링됩니다.
            </Typography>
          </Stack>

          {isLoading && !overview && <Skeleton variant="rounded" height={chartHeight} />}

          {isError && !overview && (
            <Alert severity="warning">이슈 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.</Alert>
          )}

          {!isLoading && !isError && overview && !overview.categories.length && (
            <Box sx={{ py: 5, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">표시할 최근 이슈가 없습니다.</Typography>
            </Box>
          )}

          {!!leaves.length && (
            <Box
              ref={chartRef}
              data-testid="issue-treemap"
              sx={{ position: 'relative', width: '100%', height: chartHeight, overflow: 'hidden' }}
            >
              {leaves.map((leaf) => {
                const {issue} = leaf.data;
                if (!issue) {
                  return null;
                }
                const width = leaf.x1 - leaf.x0;
                const height = leaf.y1 - leaf.y0;
                const selected = issue.category === selectedCategory;
                const showDetails = width >= 150 && height >= 92;
                const showTags = width >= 210 && height >= 130 && issue.topTags.length > 0;

                return (
                  <Tooltip
                    key={issue.category}
                    arrow
                    placement="top"
                    title={<IssueTooltip issue={issue} />}
                  >
                    <Box
                      component="button"
                      type="button"
                      data-category={issue.category}
                      aria-pressed={selected}
                      aria-label={`${formatCategory(issue.category)}, 게시물 ${issue.postCount}개, 상승률 ${formatMomentum(issue.momentumPercent)}`}
                      onClick={() =>
                        onCategorySelect(selected ? undefined : issue.category)
                      }
                      sx={{
                        position: 'absolute',
                        left: leaf.x0,
                        top: leaf.y0,
                        width,
                        height,
                        p: { xs: 0.75, sm: 1 },
                        border: 0,
                        borderRadius: 0.75,
                        overflow: 'hidden',
                        color: 'common.white',
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: `linear-gradient(145deg, ${momentumColor(issue.momentumPercent)}, ${theme.palette.common.black})`,
                        boxShadow: selected
                          ? `inset 0 0 0 3px ${theme.palette.common.white}`
                          : 'inset 0 0 0 1px rgba(255,255,255,0.14)',
                        transition: 'filter 140ms ease, transform 140ms ease, box-shadow 140ms ease',
                        '&:hover, &:focus-visible': {
                          filter: 'brightness(1.16)',
                          transform: 'scale(0.99)',
                          outline: 'none',
                          zIndex: 2,
                        },
                      }}
                    >
                      <Stack sx={{ height: '100%', justifyContent: 'space-between' }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            component="span"
                            sx={{
                              display: '-webkit-box',
                              overflow: 'hidden',
                              fontSize: width < 120 ? '0.75rem' : width < 220 ? '0.875rem' : '1rem',
                              fontWeight: 800,
                              lineHeight: 1.2,
                              WebkitBoxOrient: 'vertical',
                              WebkitLineClamp: 2,
                            }}
                          >
                            {formatCategory(issue.category)}
                          </Typography>
                          {showDetails && (
                            <Typography
                              component="span"
                              sx={{ display: 'block', mt: 0.5, fontSize: '0.72rem', opacity: 0.82 }}
                            >
                              게시물 {issue.postCount}개 · 점유율 {formatShare(issue.share)}
                            </Typography>
                          )}
                        </Box>

                        <Box>
                          {showTags && (
                            <Typography
                              component="span"
                              sx={{
                                display: 'block',
                                mb: 0.5,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                fontSize: '0.68rem',
                                opacity: 0.72,
                              }}
                            >
                              {issue.topTags.map((tag) => `#${tag}`).join(' ')}
                            </Typography>
                          )}
                          <Stack direction="row" spacing={0.375} sx={{ alignItems: 'center' }}>
                            {issue.momentumPercent >= 0 ? (
                              <TrendingUpIcon sx={{ fontSize: width < 120 ? 14 : 17 }} />
                            ) : (
                              <TrendingDownIcon sx={{ fontSize: width < 120 ? 14 : 17 }} />
                            )}
                            <Typography
                              component="span"
                              sx={{ fontSize: width < 120 ? '0.68rem' : '0.78rem', fontWeight: 750 }}
                            >
                              {formatMomentum(issue.momentumPercent)}
                            </Typography>
                          </Stack>
                        </Box>
                      </Stack>
                    </Box>
                  </Tooltip>
                );
              })}
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
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
    <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
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

function formatMomentum(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? '+' : ''}${rounded}%`;
}

function formatShare(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatImpact(value: number) {
  return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 1 }).format(value);
}

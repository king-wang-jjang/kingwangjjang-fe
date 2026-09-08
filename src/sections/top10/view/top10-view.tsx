'use client';

import type { BoardPost } from 'src/api/board-api';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { useTheme } from '@mui/material/styles';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Box,
  Alert,
  Stack,
  Button,
  Select,
  MenuItem,
  InputLabel,
  Typography,
  FormControl,
  CircularProgress,
} from '@mui/material';

import { TOP_BOARDS_TODAY, useTopBoardHistoryDates } from 'src/hooks/use-top-boards';

import { Top10List } from 'src/components/top10';
import { CommentDrawer, CommentSidebar } from 'src/components/comment';

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const SEOUL_DATE_PARTS_FORMATTER = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Seoul',
});
const HISTORY_DATE_LABEL_FORMATTER = new Intl.DateTimeFormat('ko-KR', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'short',
  timeZone: 'Asia/Seoul',
});

function getTodayInSeoul() {
  const parts = SEOUL_DATE_PARTS_FORMATTER.formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((datePart) => datePart.type === type)?.value ?? '';

  return `${part('year')}-${part('month')}-${part('day')}`;
}

function formatHistoryDateLabel(date: string) {
  return HISTORY_DATE_LABEL_FORMATTER.format(new Date(`${date}T00:00:00+09:00`));
}

type Top10ViewProps = {
  initialExpandedRank?: number;
};

type SelectedPost = {
  boardId: string;
  site: string;
} | null;

export function Top10View({ initialExpandedRank }: Top10ViewProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedDate, setSelectedDate] = useState(TOP_BOARDS_TODAY);
  const [selectedPost, setSelectedPost] = useState<SelectedPost>(null);
  const [mobileCommentOpen, setMobileCommentOpen] = useState(false);
  const {
    data: storedDates = [],
    isError: isDatesError,
    isPending: isDatesPending,
    refetch: refetchDates,
  } = useTopBoardHistoryDates();
  const today = getTodayInSeoul();
  const historyDates = useMemo(
    () =>
      Array.from(new Set(storedDates))
        .filter((date) => ISO_DATE_PATTERN.test(date) && date < today)
        .sort((left, right) => right.localeCompare(left)),
    [storedDates, today]
  );

  const handleCommentOpen = (post: BoardPost) => {
    if (!post.Id) return;

    setSelectedPost({ boardId: post.Id, site: post.site });
    if (isMobile) {
      setMobileCommentOpen(true);
    }
  };

  const handleCommentClose = () => {
    setSelectedPost(null);
    setMobileCommentOpen(false);
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    handleCommentClose();
  };

  const renderDateControls = (
    <Box
      component="section"
      aria-labelledby="top10-date-title"
      sx={{
        p: 1.25,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
        flexShrink: 0,
      }}
    >
      <Stack
        direction={{ xs: 'row', md: 'column' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'center', md: 'stretch' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography id="top10-date-title" variant="subtitle2" sx={{ fontWeight: 800 }}>
            순위 날짜
          </Typography>
        </Box>

        <FormControl size="small" sx={{ minWidth: 150, flexShrink: 0 }}>
          <InputLabel id="top10-date-select-label">날짜 선택</InputLabel>
          <Select
            labelId="top10-date-select-label"
            id="top10-date-select"
            value={selectedDate}
            label="날짜 선택"
            onChange={(event) => handleDateChange(event.target.value)}
          >
            <MenuItem value={TOP_BOARDS_TODAY}>오늘</MenuItem>
            {historyDates.map((date) => (
              <MenuItem key={date} value={date}>
                {formatHistoryDateLabel(date)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Box component="details" sx={{ mt: 1, color: 'text.secondary', fontSize: '0.75rem' }}>
        <Box component="summary" sx={{ cursor: 'pointer' }}>
          지난 순위 안내
        </Box>
        <Typography variant="caption" component="p" sx={{ mt: 0.5 }}>
          과거 기록은 이 기능 배포 이후부터 날짜별로 쌓입니다.
        </Typography>
      </Box>

      {isDatesPending && (
        <Stack direction="row" spacing={1} sx={{ mt: 1.25, alignItems: 'center' }}>
          <CircularProgress size={14} aria-label="지난 Top 10 날짜를 불러오는 중" />
          <Typography variant="caption" color="text.secondary">
            지난 순위 날짜를 확인하고 있습니다.
          </Typography>
        </Stack>
      )}

      {isDatesError && (
        <Alert
          severity="warning"
          action={
            <Button color="inherit" size="small" onClick={() => refetchDates()}>
              다시 시도
            </Button>
          }
          sx={{ mt: 1.25 }}
        >
          지난 순위 날짜를 불러오지 못했습니다. 오늘 순위는 계속 볼 수 있습니다.
        </Alert>
      )}

      {!isDatesPending && !isDatesError && !historyDates.length && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          아직 저장된 지난 순위가 없습니다.
        </Typography>
      )}
    </Box>
  );

  return (
    <Box sx={{ width: 'min(100%, 1360px)', mx: 'auto' }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{ mb: 1.25, alignItems: 'center', justifyContent: 'space-between' }}
      >
        <Typography variant="h5">일간 TOP 10</Typography>
        <Button
          component={Link}
          href="/board"
          color="inherit"
          variant="outlined"
          size="small"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ whiteSpace: 'nowrap' }}
        >
          실시간 게시판
        </Button>
      </Stack>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'minmax(0, 1fr) 280px' },
          gridTemplateAreas: { xs: '"tools" "ranking"', md: '"ranking tools"' },
          gap: 1.5,
          alignItems: 'start',
        }}
      >
        <Box sx={{ gridArea: 'ranking', minWidth: 0 }}>
          <Top10List
            variant="page"
            selectedDate={selectedDate}
            initialExpandedRank={initialExpandedRank}
            onCommentOpen={handleCommentOpen}
          />
        </Box>

        <Stack
          component="aside"
          aria-label="순위 날짜와 댓글"
          spacing={1.25}
          sx={{
            gridArea: 'tools',
            minWidth: 0,
            position: { xs: 'static', md: 'sticky' },
            top: 'var(--board-sticky-top, 78px)',
            maxHeight: { md: 'calc(100dvh - var(--board-sticky-top, 78px) - 16px)' },
            height: selectedPost
              ? { md: 'calc(100dvh - var(--board-sticky-top, 78px) - 16px)' }
              : 'auto',
            overflowY: { md: 'auto' },
            scrollbarWidth: 'thin',
          }}
        >
          {renderDateControls}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              flex: selectedPost ? 1 : 'initial',
              minHeight: selectedPost ? 260 : 'auto',
            }}
          >
            {selectedPost ? (
              <CommentSidebar
                postId={selectedPost.boardId}
                site={selectedPost.site}
                title="댓글"
                onClose={handleCommentClose}
                sx={{ position: 'static', height: '100%', width: '100%' }}
              />
            ) : (
              <Box
                sx={{
                  p: 1.5,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'background.subtle',
                }}
              >
                <Typography variant="subtitle2">순위와 댓글을 함께 보세요.</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  게시글을 펼친 뒤 댓글 열기를 누르면 여기에 표시됩니다.
                </Typography>
              </Box>
            )}
          </Box>
        </Stack>
      </Box>

      {selectedPost && (
        <CommentDrawer
          open={isMobile && mobileCommentOpen}
          onClose={handleCommentClose}
          postId={selectedPost.boardId}
          site={selectedPost.site}
          title="댓글"
        />
      )}
    </Box>
  );
}

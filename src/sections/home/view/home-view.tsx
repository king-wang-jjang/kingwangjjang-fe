'use client';

import { useRouter } from 'next/navigation';

import { Box, Stack, Button, Container, Typography } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';

import { useIssueOverview } from 'src/hooks/use-issue-overview';

import { IssueTreemap } from 'src/components/issues';

export function HomeView() {
  const router = useRouter();
  const issueOverviewQuery = useIssueOverview();

  const handleCategorySelect = (category: string | undefined) => {
    if (!category) {
      return;
    }

    const query = new URLSearchParams({ category });
    router.push(`/board?${query.toString()}`);
  };

  return (
    <Container maxWidth="xl" disableGutters>
      <Stack spacing={{ xs: 2, md: 2.5 }} sx={{ py: { xs: 0.5, md: 1.5 } }}>
        <Stack
          component="header"
          direction={{ xs: 'column', md: 'row' }}
          spacing={1.5}
          sx={{ alignItems: { xs: 'stretch', md: 'flex-end' }, justifyContent: 'space-between' }}
        >
          <Box sx={{ maxWidth: 720 }}>
            <Typography variant="overline" color="secondary.main" sx={{ fontWeight: 800 }}>
              NOW TRENDING
            </Typography>
            <Typography component="h1" variant="h3" sx={{ mt: 0.25 }}>
              지금 커지는 이야기
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.75 }}>
              최근 24시간 동안 여러 커뮤니티에서 주목받은 카테고리와 상승 흐름을 한눈에
              확인하세요.
            </Typography>
          </Box>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <Button
              href="/top10/"
              color="inherit"
              variant="outlined"
              startIcon={<EmojiEventsOutlinedIcon />}
            >
              TOP 10
            </Button>
            <Button
              href="/board"
              variant="contained"
              endIcon={<ArrowForwardRoundedIcon />}
            >
              전체 게시판 보기
            </Button>
          </Stack>
        </Stack>

        <IssueTreemap
          overview={issueOverviewQuery.data}
          isLoading={issueOverviewQuery.isPending}
          isError={issueOverviewQuery.isError}
          onCategorySelect={handleCategorySelect}
        />
      </Stack>
    </Container>
  );
}

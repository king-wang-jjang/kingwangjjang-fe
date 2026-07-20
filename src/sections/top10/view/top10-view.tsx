'use client';

import Link from 'next/link';

import { Box, Stack, Button, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import { Top10List } from 'src/components/top10';

export function Top10View() {
  return (
    <Box sx={{ width: 'min(100%, 760px)', mx: 'auto', py: { xs: 1, md: 2 } }}>
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { xs: 'stretch', sm: 'flex-end' }, justifyContent: 'space-between' }}
        >
          <Box>
            <Typography variant="h4">오늘의 TOP 10</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              하루 동안 가장 주목받은 커뮤니티 글을 순서대로 모았습니다.
            </Typography>
          </Box>
          <Button
            component={Link}
            href="/board"
            color="inherit"
            variant="outlined"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, whiteSpace: 'nowrap' }}
          >
            실시간 게시판
          </Button>
        </Stack>

        <Top10List variant="page" />
      </Stack>
    </Box>
  );
}

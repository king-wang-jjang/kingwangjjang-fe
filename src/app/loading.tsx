'use client';

import { Box, Stack, Typography, CircularProgress } from '@mui/material';

export default function Loading() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Stack spacing={2} alignItems="center">
        <CircularProgress size={32} />
        <Typography variant="body2" color="text.secondary">
          데이터를 불러오는 중입니다
        </Typography>
      </Stack>
    </Box>
  );
}

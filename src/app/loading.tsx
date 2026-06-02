'use client';

import { Box } from '@mui/material';

export default function Loading() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <Box
        className="app-loading-image"
        component="img"
        src="/loading.gif"
        width={360}
        height={120}
        alt="Loading"
        sx={{
          width: 'min(360px, calc(100vw - 48px))',
          maxWidth: 'calc(100vw - 48px)',
          height: 'auto',
          display: 'block',
          objectFit: 'contain',
        }}
      />
    </Box>
  );
}

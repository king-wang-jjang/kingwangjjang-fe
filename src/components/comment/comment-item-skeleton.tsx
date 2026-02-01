import { Stack, Skeleton } from '@mui/material';

export function CommentItemSkeleton() {
  return (
    <Stack direction="row" spacing={2} sx={{ p: 1.5 }}>
      <Skeleton variant="circular" width={40} height={40} />
      <Stack spacing={1} flexGrow={1}>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </Stack>
    </Stack>
  );
}

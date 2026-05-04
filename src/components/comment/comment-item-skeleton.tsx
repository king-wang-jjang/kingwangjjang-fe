import { Stack, Skeleton } from '@mui/material';

export function CommentItemSkeleton() {
  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        p: 1,
        my: 0.75,
        border: 1,
        borderColor: '#bfc1b7',
        borderRadius: 1,
        bgcolor: '#fdfdf8',
        '& .MuiSkeleton-root': {
          bgcolor: '#eeefe9',
        },
      }}
    >
      <Skeleton variant="circular" width={40} height={40} />
      <Stack spacing={1} flexGrow={1}>
        <Skeleton variant="text" width="40%" />
        <Skeleton variant="text" width="80%" />
        <Skeleton variant="text" width="60%" />
      </Stack>
    </Stack>
  );
}

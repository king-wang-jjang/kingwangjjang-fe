import { Box, Card, Skeleton, CardContent } from '@mui/material';

export const PostCardSkeleton = () => (
    <Box position="relative">
      <Card
        sx={{
          width: '100%',
          zIndex: '100',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <CardContent
          sx={{
            gap: '15px',
            transform: 'none',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {/* 왼쪽 컨텐츠 */}
          <Box display="flex" flexDirection="column" flexGrow={1} gap={0}>
            <Box display="flex" flexWrap="wrap" gap={0}>
              <Skeleton variant="rectangular" width={60} height={24} />
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '0px 0px' }}>
              <Skeleton variant="text" width="80%" height={24} />
            </Box>
          </Box>

          {/* 썸네일 자리 */}
          <Skeleton
            variant="rectangular"
            sx={{
              width: '80px',
              height: '70px',
              borderRadius: '8px',
              display: 'block',
              marginLeft: 'auto',
            }}
          />
        </CardContent>

        {/* Collapse가 확장될 영역 */}
        {/* <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
          <Skeleton variant="text" width="100%" height={18} />
          <Skeleton variant="text" width="90%" height={18} />
          <Skeleton variant="text" width="80%" height={18} />
        </CardContent> */}
      </Card>
    </Box>
  );

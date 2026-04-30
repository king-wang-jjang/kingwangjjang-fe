import type { Theme, SxProps } from '@mui/material/styles';

import CloseIcon from '@mui/icons-material/Close';
import { Box, Card, Stack, useTheme, Typography, IconButton, useMediaQuery } from '@mui/material';

import { useComments } from 'src/hooks/use-comments';

import { CommentForm } from './comment-form';
import { CommentSection } from './comment-section';

interface CommentSidebarProps {
  postId: string;
  site?: string;
  title?: string;
  onClose?: () => void;
  sx?: SxProps<Theme>;
}

export function CommentSidebar({ postId, site, title = '댓글', onClose, sx }: CommentSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const { comments, addComment, addReply, totalCount, loading, likeComment } = useComments({
    boardId: postId,
    site: site ?? '',
    enabled: !!postId,
  });

  // 모바일에서는 렌더링하지 않음
  if (isMobile) {
    return null;
  }

  return (
    <Card
      sx={{
        position: 'sticky',
        top: '80px',
        height: 'calc(100vh - 100px)',
        display: 'flex',
        flexDirection: 'column',
        border: '1px solid #bfc1b7',
        borderRadius: '6px',
        bgcolor: '#fdfdf8',
        boxShadow: 'none',
        overflow: 'hidden',
        ...sx,
      }}
    >
      <Box
        sx={{
          px: 1.5,
          pt: 1.5,
          pb: 1.25,
          borderBottom: '1px solid #bfc1b7',
          bgcolor: '#eeefe9',
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6" sx={{ color: '#23251d', fontWeight: 800 }}>
            {title} {totalCount > 0 ? totalCount : ''}
          </Typography>
          {onClose && (
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: '#65675e',
                border: '1px solid #bfc1b7',
                borderRadius: '4px',
                '&:hover': {
                  color: '#F54E00',
                  bgcolor: '#f4f4f4',
                },
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )}
        </Stack>
      </Box>

      <Box
        sx={{
          flex: 1,
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <CommentSection
            postId={postId}
            comments={comments}
            loading={loading}
            onAddComment={async ({ content }) => {
              await addComment(content);
            }}
            onAddReply={async (parentId, content) => {
              await addReply(parentId, content);
            }}
            onLikeComment={async (commentId) => {
              await likeComment(commentId);
            }}
          />
        </Box>
      </Box>

      {/* 고정된 댓글 입력 Footer */}
      <Box sx={{ borderTop: '1px solid #bfc1b7', bgcolor: '#fdfdf8' }}>
        <Box sx={{ p: 1.2 }}>
          <CommentForm
            onSubmit={async ({ content }) => {
              await addComment(content);
            }}
            placeholder="댓글을 입력하세요..."
            variant="composer"
          />
        </Box>
      </Box>
    </Card>
  );
}

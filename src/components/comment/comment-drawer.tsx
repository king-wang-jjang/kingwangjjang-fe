import type { Comment } from 'src/types/comment';
import type { Theme, SxProps } from '@mui/material/styles';

import { useMemo } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import { drawerClasses } from '@mui/material/Drawer';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import { Box, Stack, Drawer, IconButton, Typography } from '@mui/material';

import { useComments } from 'src/hooks/use-comments';

import { CommentForm } from './comment-form';
import { CommentSection } from './comment-section';

interface CommentDrawerProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  site?: string;
  initialComments?: Comment[];
  title?: string;
  sx?: SxProps<Theme>;
}

export function CommentDrawer({
  open,
  onClose,
  postId,
  site,
  initialComments = [],
  title = '댓글',
  sx,
}: CommentDrawerProps) {
  const paperSx = useMemo(
    () => ({
      [`& .${drawerClasses.paper}`]: {
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        height: '72vh',
        bgcolor: '#eeefe9',
        border: '1px solid #bfc1b7',
        boxShadow: '0px 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
    }),
    []
  );

  const { comments, addComment, addReply, totalCount, loading, likeComment } = useComments({
    boardId: postId,
    site: site ?? '',
    enabled: open,
  });

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ ...paperSx, ...sx }}
    >
      <Box
        sx={{
          px: 2,
          pt: 1.5,
          pb: 0.75,
          bgcolor: '#eeefe9',
          borderBottom: 1,
          borderColor: '#bfc1b7',
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
          <DragHandleIcon sx={{ color: '#9ea096' }} />
        </Box>

        <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">
            {title} {totalCount > 0 ? totalCount : ''}
          </Typography>

          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
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
        <Box sx={{ px: 0, flex: 1, overflow: 'auto' }}>
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

        {/* 고정된 댓글 입력 Footer */}
        <Box sx={{ borderTop: 1, borderColor: '#bfc1b7', bgcolor: '#fdfdf8' }}>
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
      </Box>
    </Drawer>
  );
}

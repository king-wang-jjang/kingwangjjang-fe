import type { Comment } from 'src/types/comment';
import type { Theme, SxProps } from '@mui/material/styles';

import { useMemo } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import {
  Box,
  Drawer,
  IconButton,
  Typography,
  drawerClasses,
} from '@mui/material';

import { CommentSection } from './comment-section';

interface CommentDrawerProps {
  open: boolean;
  onClose: () => void;
  postId: string;
  currentUser?: string;
  initialComments?: Comment[];
  title?: string;
  sx?: SxProps<Theme>;
}

export function CommentDrawer({
  open,
  onClose,
  postId,
  currentUser = '사용자',
  initialComments = [],
  title = '댓글',
  sx,
}: CommentDrawerProps) {
  const paperSx = useMemo(
    () => ({
      [`& .${drawerClasses.paper}`]: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: '70vh',
      },
    }),
    []
  );

  return (
    <Drawer
      anchor="bottom"
      open={open}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ ...paperSx, ...sx }}
    >
      <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0.5 }}>
          <DragHandleIcon sx={{ color: 'text.disabled' }} />
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1">{title}</Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
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
            comments={initialComments}
            currentUser={currentUser}
          />
        </Box>
      </Box>
    </Drawer>
  );
}



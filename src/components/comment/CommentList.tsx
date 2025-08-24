import type { Comment } from 'src/types/comment';

import { Box, Alert, Divider, Typography } from '@mui/material';

import { CommentItem } from './CommentItem';

interface CommentListProps {
  comments: Comment[];
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  emptyMessage?: string;
}

export const CommentList = ({
  comments,
  onLike,
  onDelete,
  emptyMessage = '아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!',
}: CommentListProps) => {
  if (!comments || comments.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center' }}>
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          {emptyMessage}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          댓글
        </Typography>
        <Typography variant="body2" color="text.secondary">
          ({comments.length})
        </Typography>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {comments.map((comment, index) => (
          <Box key={comment.id}>
            <CommentItem comment={comment} onLike={onLike} onDelete={onDelete} />
            {index < comments.length - 1 && <Divider sx={{ my: 1 }} />}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

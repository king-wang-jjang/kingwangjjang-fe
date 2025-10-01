import type { Comment } from 'src/types/comment';

import { Box, Divider, Typography } from '@mui/material';

import { CommentItem } from './comment-item';

interface CommentListProps {
  comments: Comment[];
  getReplies?: (parentId: string) => Comment[];
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (parentId: string, content: string) => void;
  emptyMessage?: string;
}

export const CommentList = ({
  comments,
  getReplies,
  onLike,
  onDelete,
  onReply,
  emptyMessage = '아직 댓글이 없습니다. 첫 번째 댓글을 작성해보세요!',
}: CommentListProps) => {
  if (!comments || comments.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="caption">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Divider sx={{ my: 1.5 }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        {comments.map((comment, index) => {
          const children = getReplies ? getReplies(comment.Id) : [];
          return (
            <Box key={comment.Id}>
              <CommentItem
                comment={comment}
                onLike={onLike}
                onDelete={onDelete}
                onReply={onReply}
                replies={children}
              />
              {index < comments.length - 1 && <Divider sx={{ my: 0.75 }} />}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

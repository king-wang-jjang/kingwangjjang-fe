import type { Comment } from 'src/types/comment';

import { Box, Typography } from '@mui/material';

import { CommentItem } from './comment-item';
import { CommentItemSkeleton } from './comment-item-skeleton';

interface CommentListProps {
  comments: Comment[];
  loading?: boolean;
  getReplies?: (parentId: string) => Comment[];
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (parentId: string, content: string) => void;
  emptyMessage?: string;
}

export const CommentList = ({
  comments,
  loading,
  getReplies,
  onLike,
  onDelete,
  onReply,
  emptyMessage = '첫 댓글을 남겨보세요.',
}: CommentListProps) => {
  if (loading) {
    return (
      <Box>
        {[...Array(3)].map((_, index) => (
          <CommentItemSkeleton key={index} />
        ))}
      </Box>
    );
  }

  if (!comments || comments.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="caption">{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pt: 1.5 }}>
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
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

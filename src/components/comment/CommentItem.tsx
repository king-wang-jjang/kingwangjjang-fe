import type { Comment } from 'src/types/comment';

import { useState } from 'react';

import { Box, Avatar, Typography, IconButton } from '@mui/material';
import { Favorite, MoreVert, FavoriteBorder } from '@mui/icons-material';

interface CommentItemProps {
  comment: Comment;
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
}

export const CommentItem = ({ comment, onLike, onDelete }: CommentItemProps) => {
  const [isLiked, setIsLiked] = useState(comment.isLiked || false);
  const [likesCount, setLikesCount] = useState(comment.likes);

  const handleLike = () => {
    if (onLike) {
      onLike(comment.id);
    }
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
  };

  const formatTimeAgo = (createdAt: string) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return '방금 전';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;

    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}일 전`;
  };

  return (
    <Box sx={{ display: 'flex', gap: 2, py: 1.5 }}>
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: 'primary.main',
          fontSize: '0.875rem',
        }}
      >
        {comment.author.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {comment.author}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {formatTimeAgo(comment.createdAt)}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 1, lineHeight: 1.5 }}>
          {comment.content}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            size="small"
            onClick={handleLike}
            sx={{
              color: isLiked ? 'error.main' : 'text.secondary',
              '&:hover': { color: 'error.main' },
            }}
          >
            {isLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
          </IconButton>
          <Typography variant="caption" color="text.secondary">
            {likesCount}
          </Typography>

          {onDelete && (
            <IconButton size="small" sx={{ color: 'text.secondary' }}>
              <MoreVert fontSize="small" />
            </IconButton>
          )}
        </Box>
      </Box>
    </Box>
  );
};

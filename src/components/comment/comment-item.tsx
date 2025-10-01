import type { Comment } from 'src/types/comment';

import { useState } from 'react';

import { Box, Avatar, Typography, IconButton, Button, Collapse } from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';

import { CommentForm } from './comment-form';

interface CommentItemProps {
  comment: Comment;
  replies?: Comment[];
  onLike?: (commentId: string) => void;
  onDelete?: (commentId: string) => void;
  onReply?: (parentId: string, content: string) => void;
}

export const CommentItem = ({ comment, replies = [], onLike, onDelete, onReply }: CommentItemProps) => {
  const [isLiked, setIsLiked] = useState(comment.likeCount > 0 || false);
  const [likesCount, setLikesCount] = useState(comment.likeCount);
  const [showReplies, setShowReplies] = useState(true);
  const [showReplyBox, setShowReplyBox] = useState(false);

  const handleLike = () => {
    if (onLike) {
      onLike(comment.Id);
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

  const isRoot = !comment.parentId;

  return (
    <Box sx={{ display: 'flex', gap: 1.5, py: 1.25, px: 1, borderRadius: 1, '&:hover': { bgcolor: 'action.hover' } }} onClick={(e) => e.stopPropagation()}>
      <Avatar sx={{ width: 28, height: 28, bgcolor: 'primary.main', fontSize: '0.75rem' }}>
        {comment.userId.charAt(0).toUpperCase()}
      </Avatar>

      <Box sx={{ flex: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5, flexWrap: 'wrap' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {comment.userId}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            · {formatTimeAgo(comment.createdAt)}
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mb: 0.75, lineHeight: 1.7 }}>
          {comment.content}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
          <IconButton size="small" onClick={handleLike} sx={{ color: isLiked ? 'error.main' : 'text.secondary', p: 0.5 }}>
            {isLiked ? <Favorite fontSize="small" /> : <FavoriteBorder fontSize="small" />}
          </IconButton>
          <Typography variant="caption" color="text.secondary">
            {likesCount}
          </Typography>
          {isRoot && (
            <Button size="small" onClick={() => setShowReplyBox((v) => !v)} sx={{ textTransform: 'none', minWidth: 0, px: 0.5 }}>
              답글
            </Button>
          )}
          {!!replies.length && (
            <Button size="small" onClick={() => setShowReplies((v) => !v)} sx={{ textTransform: 'none', minWidth: 0, px: 0.5 }}>
              {showReplies ? `답글 숨기기 (${replies.length})` : `답글 보기 (${replies.length})`}
            </Button>
          )}
        </Box>

        {/* 대댓글 입력: 루트 댓글에서만 허용 */}
        {isRoot && (
          <Collapse in={showReplyBox} timeout="auto" unmountOnExit>
            <Box sx={{ pl: 3, mt: 1 }}>
              {onReply && (
                <Box sx={{ mt: 1 }}>
                  <CommentForm
                    onSubmit={({ content }) => onReply(comment.Id, content)}
                    onCancel={() => setShowReplyBox(false)}
                    placeholder="답글 추가..."
                    variant="reply"
                    autoFocus
                  />
                </Box>
              )}
            </Box>
          </Collapse>
        )}

        {/* 대댓글 목록 */}
        <Collapse in={showReplies} timeout="auto" unmountOnExit>
          {!!replies.length && (
            <Box sx={{ mt: 1, pl: 2, ml: 1, borderLeft: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}>
              {replies.map((child) => (
                <CommentItem key={child.Id} comment={child} replies={[]} onLike={onLike} onDelete={onDelete} onReply={onReply} />
              ))}
            </Box>
          )}
        </Collapse>
      </Box>
    </Box>
  );
};

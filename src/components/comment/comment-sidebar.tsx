import type { Comment } from 'src/types/comment';
import type { Theme, SxProps } from '@mui/material/styles';

import { Box, Card, Typography, useTheme, useMediaQuery } from '@mui/material';

import { CommentSection } from './comment-section';
import { CommentForm } from './comment-form';
import { useComments } from 'src/hooks/use-comments';

interface CommentSidebarProps {
  postId: string;
  site?: string;
  currentUser?: string;
  initialComments?: Comment[];
  title?: string;
  sx?: SxProps<Theme>;
}

export function CommentSidebar({
  postId,
  site,
  currentUser = '사용자',
  initialComments = [],
  title = '댓글',
  sx,
}: CommentSidebarProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [boardIdA, boardIdB] = postId.split('-');
  const boardId = boardIdA && boardIdB ? `${boardIdA}-${boardIdB}` : postId;

  const { comments, loading, addComment, addReply } = useComments({
    boardId,
    site: site ?? '',
    currentUserId: currentUser,
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
        ...sx,
      }}
    >
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
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
            currentUser={currentUser}
            onAddComment={async ({ content }) => addComment(content)}
            onAddReply={async (parentId, content) => addReply(parentId, content)}
          />
        </Box>
      </Box>

      {/* 고정된 댓글 입력 Footer */}
      <Box sx={{ borderTop: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
        <Box sx={{ p: 2 }}>
          <CommentForm
            onSubmit={async ({ content }) => addComment(content)}
            currentUser={currentUser}
            placeholder="댓글을 입력하세요..."
            variant="composer"
          />
        </Box>
      </Box>
    </Card>
  );
}

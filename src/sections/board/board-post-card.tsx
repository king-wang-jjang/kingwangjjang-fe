import Link from 'next/link';
import { toast } from 'sonner';
import { useState, useEffect, useCallback } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import {
  Box,
  Card,
  Modal,
  Button,
  Collapse,
  useTheme,
  IconButton,
  Typography,
  CardContent,
} from '@mui/material';

import { CONFIG } from 'src/config-global';
import { addBoardLike } from 'src/api/board-api';
import { useReadStore } from 'src/store/read-store';
import { useAuthStore } from 'src/store/auth-store';

import { Label } from 'src/components/label';

interface Props {
  boardId: string;
  site: string;
  title: string;
  url: string;
  createTime: string;
  thumbnail: string;
  gptAnswer: string;
  commentCount: number;
  likeCount?: number;
  onClickToggle: (boardId: string, site: string) => void;
  onCommentClick?: (boardId: string, site: string) => void;
}

export const PostCard = ({
  boardId,
  site,
  title,
  url,
  createTime,
  thumbnail,
  gptAnswer,
  commentCount,
  likeCount = 0,
  onClickToggle,
  onCommentClick,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);

  const theme = useTheme();
  const { isRead, markAsRead } = useReadStore();
  const { isAuthenticated } = useAuthStore();
  const readStatus = isRead(boardId);

  const handleLinkClick = (e: React.MouseEvent, _boardId: string, _site: string) => {
    e.stopPropagation();
    markAsRead(_boardId);
  };

  const handleToggle = (_boardId: string) => {
    // 텍스트가 선택되어 있으면 토글하지 않음 (드래그 방지)
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    markAsRead(_boardId);
    onClickToggle(_boardId, site);

    if (!expanded) {
      setExpanded(true);
    }
  };

  const handleSummaryClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setExpanded(false);
  };

  const handleImageClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setImageModalOpen(true);
  };

  const handleCloseImageModal = () => {
    setImageModalOpen(false);
  };

  const handleOpenComments = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onCommentClick) {
      onCommentClick(boardId, site);
    }
  };

  useEffect(() => {
    setCurrentLikeCount(likeCount);
  }, [likeCount]);

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
      return;
    }

    try {
      const result = await addBoardLike(boardId);
      setCurrentLikeCount(result.likeCount);
    } catch (error: any) {
      toast.warning(`좋아요 추가 실패: ${error.message || error}`);
    }
  };

  const thumbnailSrc = thumbnail
    ? `${CONFIG.imageServerUrl}/${thumbnail}`
    : '/logo/logo-default.svg'; // 로컬 경로로 대체
  // 🕒 남은 시간을 계산하는 함수
  const calculateTimeAgo = useCallback(() => {
    const createdTime = new Date(createTime);
    const now = new Date();
    const diffMs = now.getTime() - createdTime.getTime(); // 밀리초 차이
    const diffMinutes = Math.floor(diffMs / 60000); // 분 단위로 변환

    if (diffMinutes < 5) return '방금';
    if (diffMinutes < 60) return `${diffMinutes}분 전`;

    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;
    return `${diffHours}시간 ${remainingMinutes}분 전`;
  }, [createTime]);

  useEffect(() => {
    setTimeAgo(calculateTimeAgo());
  }, [calculateTimeAgo]);

  return (
    <Box position="relative">
      <Card
        sx={{
          width: '100%',
          zIndex: 1,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          overflow: 'hidden',
          border: '1px solid #bfc1b7',
          borderRadius: '6px',
          bgcolor: '#fdfdf8',
          boxShadow: 'none',
          transition: theme.transitions.create(['border-color', 'transform', 'background-color'], {
            duration: theme.transitions.duration.shorter,
          }),
          '&:hover': {
            borderColor: '#F54E00',
            transform: 'translateY(-1px)',
          },
          '&:hover .post-title': {
            color: '#F54E00',
          },
        }}
        onClick={() => boardId && handleToggle(boardId)}
      >
        <CardContent
          sx={{
            gap: 1.5,
            transform: 'none',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'stretch',
            p: { xs: 1.25, sm: 1.5 },
            '&:last-child': { pb: { xs: 1.25, sm: 1.5 } },
          }}
        >
          <Box
            component="div"
            display="flex"
            flexDirection="column"
            gap={0.75}
            sx={{ minWidth: 0, flex: 1, opacity: readStatus ? 0.62 : 1 }}
          >
            <Box display="flex" flexWrap="wrap" gap={0.75} alignItems="center">
              <Label
                color="primary"
                sx={{
                  height: 20,
                  px: 0.75,
                  bgcolor: '#eeefe9',
                  color: '#23251d',
                  border: '1px solid #bfc1b7',
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                {site}
              </Label>
              <Typography variant="caption" component="span" sx={{ color: '#65675e' }}>
                {timeAgo}
              </Typography>
              {/* <Label color="secondary" startIcon={<StarIcon fontSize="small" />}> rank</Label> */}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
              <Typography
                className="post-title"
                variant="body2"
                component="div"
                sx={{
                  color: '#23251d',
                  fontSize: 15,
                  fontWeight: 800,
                  lineHeight: 1.45,
                  transition: theme.transitions.create('color', {
                    duration: theme.transitions.duration.shorter,
                  }),
                }}
              >
                {title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mt: 0.85 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#65675e',
                  }}
                >
                  <ChatBubbleOutlineIcon sx={{ fontSize: 15 }} />
                  <Typography variant="caption" component="span" sx={{ color: 'inherit' }}>
                    {commentCount}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    color: '#65675e',
                    '&:hover': { color: '#F54E00' },
                  }}
                  onClick={handleLike}
                >
                  <FavoriteBorderIcon sx={{ fontSize: 15 }} />
                  <Typography variant="caption" component="span" sx={{ color: 'inherit' }}>
                    {currentLikeCount}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
          {/* 오른쪽 그룹: 썸네일 (끝자락 고정) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Box
              component="img"
              src={thumbnailSrc}
              alt="thumbnail"
              onClick={handleImageClick}
              sx={{
                width: { xs: 70, sm: 82 },
                height: { xs: 70, sm: 82 },
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: '5px',
                border: '1px solid #bfc1b7',
                display: 'block',
                flexShrink: 0,
                cursor: 'pointer',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'scale(1.05)',
                },
              }}
            />
          </Box>
        </CardContent>

        <Collapse in={expanded} timeout="auto">
          <CardContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              userSelect: 'text',
              borderTop: '1px dashed #bfc1b7',
              bgcolor: '#eeefe9',
              p: { xs: 1.25, sm: 1.5 },
            }}
          >
            <Box
              sx={{
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Typography
                variant="overline"
                component="div"
                sx={{
                  color: '#23251d',
                  fontWeight: 900,
                  lineHeight: 1.4,
                }}
              >
                GPT 요약
              </Typography>

              <IconButton
                aria-label="GPT 요약 접기"
                size="small"
                onClick={handleSummaryClose}
                sx={{
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                  border: '1px solid #bfc1b7',
                  borderRadius: '4px',
                  bgcolor: '#fdfdf8',
                  color: '#4d4f46',
                  '&:hover': {
                    bgcolor: '#f4f4f4',
                    color: '#F54E00',
                    borderColor: '#F54E00',
                  },
                }}
              >
                <KeyboardArrowUpIcon sx={{ fontSize: 19 }} />
              </IconButton>
            </Box>

            <Typography
              variant="body2"
              component="div"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                mb: 2,
                userSelect: 'text',
                color: '#4d4f46',
                lineHeight: 1.65,
              }}
            >
              {gptAnswer}
            </Typography>

            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 1,
                width: '100%',
                flexWrap: 'wrap',
              }}
            >
              <Button
                component={Link}
                href={url}
                target="_blank"
                onClick={(e) => handleLinkClick(e, boardId, site)}
                startIcon={<LaunchIcon sx={{ fontSize: 17 }} />}
                variant="text"
                size="small"
                sx={{
                  minWidth: 0,
                  px: 1.1,
                  height: 34,
                  borderRadius: '6px',
                  border: '1px solid #bfc1b7',
                  bgcolor: '#fdfdf8',
                  color: '#65675e',
                  fontWeight: 700,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#f4f4f4',
                    color: '#F54E00',
                    borderColor: '#F54E00',
                    boxShadow: 'none',
                  },
                }}
              >
                원문 바로가기
              </Button>

              <Button
                onClick={handleOpenComments}
                startIcon={<ChatBubbleOutlineIcon sx={{ fontSize: 17 }} />}
                variant="text"
                size="small"
                disabled={!onCommentClick}
                sx={{
                  minWidth: 0,
                  px: 1.1,
                  height: 34,
                  borderRadius: '6px',
                  border: '1px solid #bfc1b7',
                  bgcolor: '#fdfdf8',
                  color: '#65675e',
                  fontWeight: 700,
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#f4f4f4',
                    color: '#F54E00',
                    borderColor: '#F54E00',
                    boxShadow: 'none',
                  },
                  '&.Mui-disabled': {
                    bgcolor: '#d6d7ce',
                    color: '#7a7d73',
                  },
                }}
              >
                댓글 보기
              </Button>
            </Box>
          </CardContent>
        </Collapse>
      </Card>

      {/* 이미지 모달 */}
      <Modal
        open={imageModalOpen}
        onClose={handleCloseImageModal}
        aria-labelledby="image-modal-title"
        aria-describedby="image-modal-description"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
        }}
      >
        <Box
          sx={{
            position: 'relative',
            maxWidth: '90vw',
            maxHeight: '90vh',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 24,
            overflow: 'hidden',
          }}
        >
          <IconButton
            onClick={handleCloseImageModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              bgcolor: 'rgba(0, 0, 0, 0.5)',
              color: 'white',
              zIndex: 1,
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={thumbnailSrc}
            alt="thumbnail"
            sx={{
              width: '100%',
              height: 'auto',
              maxHeight: '90vh',
              objectFit: 'contain',
              display: 'block',
            }}
          />
        </Box>
      </Modal>
    </Box>
  );
};

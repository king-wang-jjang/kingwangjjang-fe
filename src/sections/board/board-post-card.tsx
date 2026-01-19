import Link from 'next/link';
import anime from 'animejs/lib/anime.es.js';
import { useRef, useState, useEffect, useCallback } from 'react';

import { useMutation } from '@apollo/client';
import CloseIcon from '@mui/icons-material/Close';
import LaunchIcon from '@mui/icons-material/Launch';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import {
  Box,
  Card,
  Modal,
  Collapse,
  useTheme,
  IconButton,
  Typography,
  CardContent,
  useMediaQuery,
} from '@mui/material';

import { toast } from 'sonner';
import { CONFIG } from 'src/config-global';
import { useReadStore } from 'src/store/read-store';
import { useAuthStore } from 'src/store/auth-store';
import { ADD_LIKE_MUTATION } from 'src/apollo/board-gql';
import { boardServiceClient } from 'src/apollo';

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
  const cardRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [currentLikeCount, setCurrentLikeCount] = useState(likeCount);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isRead, markAsRead } = useReadStore();
  const { isAuthenticated } = useAuthStore();
  const readStatus = isRead(boardId);

  const [addLike] = useMutation(ADD_LIKE_MUTATION, {
    client: boardServiceClient,
    onCompleted: (data) => {
      if (data?.addLike?.likeCount !== undefined) {
        setCurrentLikeCount(data.addLike.likeCount);
      }
    },
    onError: (error) => {
      toast.warning(`좋아요 추가 실패: ${error.message || error}`);
    },
  });

  const handleMouseOver = () => {
    if (!isMobile) {
      setIsHovering(true);
    }
  };

  const handleMouseOut = () => {
    if (!isMobile) {
      setIsHovering(false);
    }
  };

  const handleLinkClick = (e: React.MouseEvent, _boardId: string, _site: string) => {
    e.stopPropagation();
    markAsRead(_boardId);
  };

  useEffect(() => {
    const cardElement = cardRef.current;
    if (cardElement) {
      anime({
        targets: cardElement,
        scaleX: isHovering ? 0.95 : 1,
        duration: 300,
        easing: 'easeInOutQuad',
      });
    }
  }, [isHovering]);

  const handleToggle = (_boardId: string) => {
    // 텍스트가 선택되어 있으면 토글하지 않음 (드래그 방지)
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) {
      return;
    }

    setExpanded(!expanded);
    if (!expanded) {
      markAsRead(_boardId);
      onClickToggle(_boardId, site);
    }
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

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('로그인이 필요합니다.');
    }
    
    addLike({
      variables: {
        boardId,
      },
    });
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
    <Box position="relative" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <Card
        ref={cardRef}
        sx={{
          width: '100%',
          zIndex: '100',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
          transformOrigin: 'left center',
        }}
        onClick={() => boardId && handleToggle(boardId)}
      >
        <CardContent
          sx={{
            gap: '15px',
            transform: 'none',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Box
            component="div"
            display="flex"
            flexDirection="column"
            gap={0}
            sx={{ opacity: readStatus ? 0.6 : 1 }}
          >
            <Box display="flex" flexWrap="wrap" gap={0}>
              <Label color="primary">{site}</Label>
              {/* <Label color="secondary" startIcon={<StarIcon fontSize="small" />}> rank</Label> */}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
              <Typography variant="body2" component="div">
                {title}
              </Typography>
              <Typography variant="caption" component="div" color="text.secondary">
                {timeAgo}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Box
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }}
                  onClick={handleOpenComments}
                >
                  <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" component="span" color="text.secondary">
                    {commentCount}
                  </Typography>
                </Box>
                <Box
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 0.5, 
                  }}
                  onClick={handleLike}
                >
                  <FavoriteBorderIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" component="span" color="text.secondary">
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
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: '8px',
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
          <CardContent sx={{ display: 'flex', flexDirection: 'column', userSelect: 'text' }}>
            <Typography
              variant="body2"
              component="div"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mb: 2, userSelect: 'text' }}
            >
              {gptAnswer}
              <br />
              {boardId}, {site}
            </Typography>

            {isMobile && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  width: '100%',
                  marginTop: '10px',
                }}
              >
                <Link
                  href={url}
                  target="_blank"
                  passHref
                  onClick={(e) => handleLinkClick(e, boardId, site)}
                >
                  <LaunchIcon />
                </Link>
              </Box>
            )}
          </CardContent>
        </Collapse>
      </Card>
      <Box
        sx={{
          position: 'absolute',
          top: '0',
          borderRadius: '20px',
          left: '0',
          bgcolor: '#3b82f6',
          width: '100%',
          height: '100%',
          boxShadow: 'none',
        }}
      >
        <Link
          href={url}
          target="_blank"
          passHref
          onClick={(e) => handleLinkClick(e, boardId, site)}
        >
          <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="end">
            <LaunchIcon sx={{ width: '50px', color: 'white' }} />
          </Box>
        </Link>
      </Box>

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

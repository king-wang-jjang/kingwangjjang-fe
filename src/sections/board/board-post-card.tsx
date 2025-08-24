import Link from 'next/link';
import anime from 'animejs/lib/anime.es.js';
import { useRef, useState, useEffect, useCallback } from 'react';

import LaunchIcon from '@mui/icons-material/Launch';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import {
  Box,
  Card,
  Collapse,
  useTheme,
  Typography,
  CardContent,
  useMediaQuery,
} from '@mui/material';

import { CONFIG } from 'src/config-global';
import { useReadStore } from 'src/store/read-store';

import { Label } from 'src/components/label';
import { CommentSection } from 'src/components/comment';

interface Props {
  id: string[];
  site: string;
  title: string;
  url: string;
  createTime: string; // 생성 시간 (ISO 형식)
  thumbnail: string;
  gptAnswer: string;
  onClickToggle: (boardId: string[], site: string) => void;
}

export const PostCard = ({
  id,
  site,
  title,
  url,
  createTime,
  thumbnail,
  gptAnswer,
  onClickToggle,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const [timeAgo, setTimeAgo] = useState('');

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isRead, markAsRead } = useReadStore();
  const readStatus = isRead(id[0], id[1], site);

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

  const handleLinkClick = (e: React.MouseEvent, boardId: string[], _site: string) => {
    e.stopPropagation();
    markAsRead(boardId[0], boardId[1], site);
  };

  useEffect(() => {
    const cardElement = cardRef.current;
    if (cardElement) {
      anime({
        targets: cardElement,
        translateX: isHovering ? -50 : 0,
        duration: 300,
        easing: 'easeInOutQuad',
      });
    }
  }, [isHovering]);

  const handleToggle = (boardId: string[], _site: string) => {
    setExpanded(!expanded);
    if (!expanded) {
      markAsRead(boardId[0], boardId[1], site);
      onClickToggle(boardId, _site);
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
        }}
        onClick={() => handleToggle(id, site)}
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
            </Box>
          </Box>
          {/* 오른쪽 그룹: 좋아요/댓글 + 썸네일 (끝자락 고정) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" component="span" color="text.secondary">
                  0
                </Typography>
              </Box>
              <Typography variant="caption" component="div" color="text.secondary">
                •
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <FavoriteBorderIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                <Typography variant="caption" component="span" color="text.secondary">
                  0
                </Typography>
              </Box>
            </Box>
            <Box
              component="img"
              src={thumbnailSrc}
              alt="thumbnail"
              sx={{
                width: '80px',
                height: '80px',
                objectFit: 'cover',
                objectPosition: 'center',
                borderRadius: '8px',
                display: 'block',
                flexShrink: 0,
              }}
            />
          </Box>
        </CardContent>

        <Collapse in={expanded} timeout="auto">
          <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="body2"
              component="div"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', mb: 2 }}
            >
              {gptAnswer}
              <br />
              {id[0]}, {id[1]}
            </Typography>

            {/* 댓글 섹션 */}
            <CommentSection postId={`${id[0]}-${id[1]}`} currentUser="사용자" />

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
                  onClick={(e) => handleLinkClick(e, id, site)}
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
        <Link href={url} target="_blank" passHref onClick={(e) => handleLinkClick(e, id, site)}>
          <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="end">
            <LaunchIcon sx={{ width: '50px', color: 'white' }} />
          </Box>
        </Link>
      </Box>
    </Box>
  );
};

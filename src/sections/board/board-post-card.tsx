import type { IPostCard } from 'src/types/board';

import Link from 'next/link';
import { useRef, useState, useEffect } from 'react';

import LaunchIcon from '@mui/icons-material/Launch';
import {
  Box,
  Card,
  Tooltip,
  Collapse,
  useTheme,
  Typography,
  CardContent,
  useMediaQuery,
} from '@mui/material';

import { Label } from 'src/components/label';
// import Label from '@/app/components/ui/Label';
// import anime from 'animejs/lib/anime.es.js';
import anime from 'animejs/lib/anime.es.js';

import StarIcon from '@mui/icons-material/Star';

interface Props extends IPostCard {
  onClickToggle: (boardId: string, site: string) => void;
}

export const PostCard = ({
  id,
  site,
  title,
  url,
  createTime,
  GPTAnswer,
  rank,
  onClickToggle,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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

  const handleToggle = (boardId: string, _site: string) => {
    setExpanded(!expanded);
    if (!expanded) {
      onClickToggle(boardId, _site);
    }
  };

  const isRank: boolean = rank !== null;
  return (
    <Box position="relative" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <Card
        ref={cardRef}
        sx={{ width: '100%', zIndex: '100', position: 'relative' }}
        onClick={() => handleToggle(id, site)}
      >
        <CardContent sx={{ transform: 'none', display: 'flex', flexDirection: 'column' }}>
          {/*  'filled' | 'outlined' | 'soft' | 'inverted'; */}
          <Box display="flex" flexWrap="wrap" gap={1}>
            <Label color="primary">{site}</Label>
            {isRank && (
              <Label color="secondary" startIcon={<StarIcon fontSize="small" />}>
                {rank}
              </Label>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '5px 0px',
              gap: '5px',
            }}
          >
            <Tooltip title={String(createTime)} arrow>
              <Typography variant="body2" component="div">
                {title}
              </Typography>
            </Tooltip>
            {isMobile && (
              <Link href={url} target="_blank" passHref onClick={(e) => e.stopPropagation()}>
                <LaunchIcon />
              </Link>
            )}
          </Box>
          <Box>
            <Collapse in={expanded} timeout="auto">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '5px 0px',
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {GPTAnswer}
                </Typography>
              </Box>
            </Collapse>
          </Box>
        </CardContent>
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
        <Link href={url} target="_blank" passHref onClick={(e) => e.stopPropagation()}>
          <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="end">
            <LaunchIcon sx={{ width: '50px', color: 'white' }} />
          </Box>
        </Link>
      </Box>
    </Box>
  );
};

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

import { CONFIG } from 'src/config-global';

interface Props extends IPostCard {
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
  // rank,
  onClickToggle,
}: Props) => {
  const [expanded, setExpanded] = useState(false);
  const cardRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const handleToggle = (boardId: string[], _site: string) => {
    setExpanded(!expanded);
    if (!expanded) {
      onClickToggle(boardId, _site);
    }
  };

  const isRank: boolean = false; // rank !== null;
  const defaultThumbnail = `${CONFIG.assetsDir}/logo/logo-default.svg`;
  const thumbnailSrc = thumbnail || defaultThumbnail;
  return (
    <Box position="relative" onMouseOver={handleMouseOver} onMouseOut={handleMouseOut}>
      <Card
        ref={cardRef}
        sx={{ width: '100%', zIndex: '100', position: 'relative', display: 'flex', alignItems: 'center' }}
        onClick={() => handleToggle(id, site)}
      >
        <CardContent sx={{ gap: '15px', transform: 'none', display: 'flex', flexDirection: 'row', flexGrow: 1 }}>
          {/*  'filled' | 'outlined' | 'soft' | 'inverted'; */}
          <Box
            component="img"
            src={thumbnailSrc}
            alt="thumbnail"
            sx={{
              width: 60, // 썸네일 크기 조정
              height: 60,
              objectFit: 'cover',
              borderRadius: '8px',
            }}
          />
          <Box display="flex" flexDirection="column" gap={0}>
            <Box display="flex" flexWrap="wrap" gap={0}>
              <Label color="primary">{site}</Label>
              {isRank && (
                <Label color="secondary" startIcon={<StarIcon fontSize="small" />}>
                  {/* {rank} */}
                </Label>
              )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '0px 0px', }} >
              <Box display="flex" flexDirection="column" flexGrow={1}>
                <Tooltip title={String(createTime)} arrow>
                  <Typography variant="body2" component="div">
                    {title}
                  </Typography>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        
          
          <Box>
            <Collapse in={expanded} timeout="auto">
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '2px 0px',
                }}
              >
                <Typography
                  variant="body2"
                  component="div"
                  sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                >
                  {gptAnswer}
                  <br/>
                  {id[0]}, {id[1]}
                </Typography>
              </Box>
              { isMobile && (
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', width: '100%', marginTop: '10px' }}>
                    <Link href={url} target="_blank" passHref onClick={(e) => e.stopPropagation()}>
                        <LaunchIcon />
                    </Link> 
                  </Box>
                )
              }
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

import { useRef, useState, useEffect } from 'react';
import { Box, Card, Tooltip, Collapse, Typography, CardContent, useTheme, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import LaunchIcon from '@mui/icons-material/Launch';
import { Label } from 'src/components/label';
import { CONFIG } from 'src/config-global';
import anime from 'animejs/lib/anime.es.js';
import StarIcon from '@mui/icons-material/Star';

interface Props {
  id: string[];
  site: string;
  title: string;
  url: string;
  createTime: string;
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


  const thumbnailSrc = thumbnail
  ? `${CONFIG.imageServerUrl}/${thumbnail}`
  : '/logo/logo-default.svg'; // 로컬 경로로 대체

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
            }}
          />
          <Box display="flex" flexDirection="column" gap={0}>
            <Box display="flex" flexWrap="wrap" gap={0}>
              <Label color="primary">{site}</Label>
              {/* <Label color="secondary" startIcon={<StarIcon fontSize="small" />}> rank</Label> */}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', padding: '0px 0px' }}>
              <Box display="flex" flexDirection="column" flexGrow={1}>
                <Tooltip title={String(createTime)} arrow>
                  <Typography variant="body1" component="div">
                    {title}
                  </Typography>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </CardContent>

        {/* Collapse 영역을 세로로 확장 */}
        <Collapse in={expanded} timeout="auto">
          <CardContent sx={{ display: 'flex', flexDirection: 'column' }}>
            <Typography
              variant="body2"
              component="div"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {gptAnswer}
              <br />
              {id[0]}, {id[1]}
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
                <Link href={url} target="_blank" passHref onClick={(e) => e.stopPropagation()}>
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
        <Link href={url} target="_blank" passHref onClick={(e) => e.stopPropagation()}>
          <Box width="100%" height="100%" display="flex" alignItems="center" justifyContent="end">
            <LaunchIcon sx={{ width: '50px', color: 'white' }} />
          </Box>
        </Link>
      </Box>
    </Box>
  );
};

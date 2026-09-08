'use client';

import type { UserType } from 'src/auth/types';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

import MenuIcon from '@mui/icons-material/Menu';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import VideoLibraryOutlinedIcon from '@mui/icons-material/VideoLibraryOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import {
  Box,
  Menu,
  Avatar,
  Drawer,
  AppBar,
  Divider,
  Toolbar,
  MenuItem,
  IconButton,
  Typography,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  CircularProgress,
} from '@mui/material';

import { useHideHeaderOnScroll } from 'src/hooks/use-hide-header-on-scroll';

import { useAuthStore } from 'src/store/auth-store';
import { ColorModeToggle } from 'src/theme/color-mode-toggle';

import { isAdmin } from 'src/auth/permissions';
import SocialLoginButtons from 'src/auth/components/form-oauth';

// Home tokens intentionally do not change the shared application theme.
// eslint-disable-next-line perfectionist/sort-imports
import homeDesign from 'src/sections/home/home-design.module.css';

const drawerWidth = 236;
const headerHeight = 58;

type Props = {
  children: React.ReactNode;
};

type AuthenticatedUser = NonNullable<UserType>;

const navItems = [
  {
    label: '커뮤니티 동향',
    href: '/',
    icon: <InsightsOutlinedIcon fontSize="small" />,
  },
  {
    label: '실시간 게시판',
    href: '/board',
    icon: <ArticleOutlinedIcon fontSize="small" />,
  },
  {
    label: 'TOP 10',
    href: '/top10/',
    icon: <EmojiEventsOutlinedIcon fontSize="small" />,
  },
  {
    label: 'Shorts Studio',
    href: '/admin/shorts',
    icon: <VideoLibraryOutlinedIcon fontSize="small" />,
    adminOnly: true,
  },
  {
    label: 'AI Resource',
    href: '/admin/resources',
    icon: <DnsOutlinedIcon fontSize="small" />,
    adminOnly: true,
  },
];

function SidebarContent({
  isAdminUser,
  onNavigate,
}: {
  isAdminUser: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const availableNavItems = navItems.filter((item) => !item.adminOnly || isAdminUser);

  return (
    <Box sx={{ px: 1.5, py: 2 }}>
      <Box sx={{ px: 1, pb: 2.5 }}>
        <Typography variant="overline" color="text.secondary">
          Workspace
        </Typography>
      </Box>

      {availableNavItems.map((item) => {
        const selected = pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <ListItemButton
            key={item.href}
            component={Link}
            href={item.href}
            selected={selected}
            onClick={onNavigate}
            sx={{
              mb: 0.5,
              borderRadius: 1,
              minHeight: 40,
              color: 'text.primary',
              border: 1,
              borderColor: selected ? 'divider' : 'transparent',
              bgcolor: selected ? 'background.muted' : 'transparent',
              '&:hover': {
                bgcolor: 'background.hover',
                color: 'secondary.main',
                '& .MuiListItemIcon-root': {
                  color: 'secondary.main',
                },
              },
              '&.Mui-selected': {
                bgcolor: 'background.muted',
                color: 'text.primary',
                '& .MuiListItemIcon-root': {
                  color: 'text.primary',
                },
                '&:hover': {
                  bgcolor: 'background.hover',
                  color: 'secondary.main',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 34,
                color: selected ? 'text.primary' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.label}
              slotProps={{ primary: { variant: 'body2', sx: { fontWeight: 700 } } }}
            />
          </ListItemButton>
        );
      })}
    </Box>
  );
}

function userDisplayName(user: AuthenticatedUser) {
  return user.displayName || user.nickname || `카카오 사용자 ${user.userId}`;
}

function userInitial(user: AuthenticatedUser) {
  return userDisplayName(user).trim().charAt(0).toUpperCase();
}

function UserProfileMenu({ user }: { user: AuthenticatedUser }) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const displayName = userDisplayName(user);

  const closeMenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton
        onClick={(event) => setAnchorEl(event.currentTarget)}
        aria-label="사용자 메뉴 열기"
        aria-controls={menuOpen ? 'user-profile-menu' : undefined}
        aria-haspopup="menu"
        aria-expanded={menuOpen ? 'true' : undefined}
        sx={{
          width: 38,
          height: 38,
          p: 0,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.subtle',
          '&:hover': {
            borderColor: 'secondary.main',
            bgcolor: 'background.hover',
          },
        }}
      >
        <Avatar
          src={user?.profileImage || undefined}
          alt={displayName}
          sx={{
            width: 32,
            height: 32,
            bgcolor: 'primary.main',
            color: 'primary.contrastText',
            fontSize: '0.8rem',
            fontWeight: 800,
          }}
        >
          {userInitial(user)}
        </Avatar>
      </IconButton>

      <Menu
        id="user-profile-menu"
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 260,
              border: 1,
              borderColor: 'divider',
              boxShadow: '0 12px 30px rgba(35, 37, 29, 0.14)',
            },
          },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            {displayName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user.authProvider} · {user.userId}
          </Typography>
        </Box>
        <Divider />
        <MenuItem component={Link} href="/account/settings" onClick={closeMenu}>
          <ListItemIcon>
            <AccountCircleOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="설정" secondary="프로필 정보 확인" />
        </MenuItem>
        <MenuItem component={Link} href="/account/history" onClick={closeMenu}>
          <ListItemIcon>
            <HistoryOutlinedIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="기록" secondary="활동 기록 확인" />
        </MenuItem>
        {isAdmin(user) && (
          <>
            <MenuItem component={Link} href="/admin/shorts" onClick={closeMenu}>
              <ListItemIcon>
                <VideoLibraryOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Shorts Studio" secondary="Top 10 제작 데이터" />
            </MenuItem>
            <MenuItem component={Link} href="/admin/resources" onClick={closeMenu}>
              <ListItemIcon>
                <DnsOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="AI Resource" secondary="Node 처리량 및 라우팅 관리" />
            </MenuItem>
          </>
        )}
      </Menu>
    </>
  );
}

export function AppShell({ children }: Props) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, user, authStatus } = useAuthStore();
  const isAdminUser = isAdmin(user);
  const isHomeRoute = pathname === '/';
  const isBoardRoute = pathname === '/board' || pathname.startsWith('/board/');
  const headerHidden = useHideHeaderOnScroll(isBoardRoute, 64, pathname);

  const toggleMobileNav = () => {
    setMobileOpen((open) => !open);
  };

  return (
    <Box
      className={isHomeRoute ? homeDesign.theme : undefined}
      sx={{
        '--board-sticky-top': headerHidden ? '12px' : '78px',
        width: '100%',
        minHeight: '100vh',
        bgcolor: isHomeRoute ? 'var(--home-canvas)' : 'background.default',
        color: isHomeRoute ? 'var(--home-ink)' : 'text.primary',
      }}
    >
      <AppBar
        className="app-header"
        position="fixed"
        enableColorOnDark={isHomeRoute}
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: isHomeRoute ? 'var(--home-stage-ink)' : 'text.primary',
          bgcolor: isHomeRoute ? 'var(--home-stage-bg)' : 'background.default',
          borderBottom: isHomeRoute ? 0 : 1,
          borderColor: isHomeRoute ? 'var(--home-stage-rule)' : 'divider',
          boxShadow: isHomeRoute ? 'inset 0 -1px 0 var(--home-stage-rule)' : 'none',
          transform: headerHidden ? 'translateY(-100%)' : 'translateY(0)',
          '&:focus-within': {
            transform: 'translateY(0)',
          },
          transition: (theme) =>
            theme.transitions.create('transform', {
              duration: theme.transitions.duration.shorter,
            }),
          '@media (prefers-reduced-motion: reduce)': {
            transition: 'none',
          },
        }}
      >
        <Toolbar
          sx={{
            minHeight: isHomeRoute ? 'var(--home-header-height)' : headerHeight,
            ...(isHomeRoute && {
              '@media (min-width: 0px)': { minHeight: 'var(--home-header-height)' },
            }),
            width: isHomeRoute ? 'min(calc(100% - var(--home-gutter) * 2), 1536px)' : '100%',
            maxWidth: isHomeRoute ? 1536 : 'none',
            mx: isHomeRoute ? 'auto' : 0,
            mt: 0,
            px: isHomeRoute ? 0 : { xs: 1.5, md: 3 },
            position: 'relative',
            justifyContent: 'space-between',
          }}
        >
          <Box
            component={Link}
            href="/"
            aria-label="홈으로 이동"
            sx={{
              width: isHomeRoute ? 'auto' : 40,
              height: 40,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: isHomeRoute ? 'flex-start' : 'center',
              gap: isHomeRoute ? 1.5 : 0,
              flexShrink: 0,
            }}
          >
            {isHomeRoute ? (
              <>
                <Box
                  component="img"
                  src="/logo/logo-single.svg"
                  alt="마약"
                  sx={{ width: 40, height: 40, display: 'block' }}
                />
                <Typography
                  component="span"
                  sx={{
                    display: { xs: 'none', sm: 'block' },
                    fontSize: '1.4rem',
                    fontWeight: 600,
                    letterSpacing: '-0.035em',
                  }}
                >
                  마약
                </Typography>
              </>
            ) : (
              <Box
                component="img"
                src="/logo/logo-single.svg"
                alt="마약"
                sx={{ width: '100%', height: '100%', display: 'block' }}
              />
            )}
          </Box>

          {isHomeRoute && (
            <Box
              component="nav"
              aria-label="홈 주요 메뉴"
              sx={{
                position: 'absolute',
                left: '50%',
                display: { xs: 'none', md: 'inline-flex' },
                alignItems: 'center',
                gap: 0.5,
                p: 0.75,
                borderRadius: '999px',
                bgcolor: 'transparent',
                transform: 'translateX(-50%)',
              }}
            >
              {[
                { label: '동향', href: '#community-pulse' },
                { label: '출처별', href: '#cross-community' },
                { label: '인기글', href: '#popular-feed' },
                { label: '게시판', href: '/board' },
              ].map((item) => (
                <Box
                  key={item.href}
                  component={Link}
                  href={item.href}
                  sx={{
                    minHeight: 44,
                    px: 2.5,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'inherit',
                    borderRadius: '999px',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    transition: 'background-color 150ms ease',
                    '&:hover': {
                      bgcolor: 'var(--home-stage-accent-soft)',
                    },
                  }}
                >
                  {item.label}
                </Box>
              ))}
            </Box>
          )}

          <Box
            className="header-login-actions"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
              ...(isHomeRoute && {
                '& > .MuiIconButton-root': {
                  width: 44,
                  height: 44,
                  color: 'var(--home-stage-ink)',
                  bgcolor: 'var(--home-stage-accent-soft)',
                  border: 0,
                  borderRadius: '50%',
                },
                '& .kakao-login-button': {
                  minHeight: 44,
                  px: 2,
                  borderRadius: '999px',
                  bgcolor: 'var(--home-stage-accent)',
                  color: 'var(--home-primary-ink)',
                  borderColor: 'transparent',
                  '&:hover': {
                    filter: 'brightness(0.96)',
                  },
                },
              }),
            }}
          >
            <ColorModeToggle />

            {authStatus === 'checking' ? (
              <CircularProgress size={24} aria-label="로그인 상태 확인 중" />
            ) : isAuthenticated && user ? (
              <UserProfileMenu user={user} />
            ) : (
              <SocialLoginButtons />
            )}

            <IconButton
              onClick={toggleMobileNav}
              aria-label="메뉴 열기"
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={toggleMobileNav}
        ModalProps={{ keepMounted: true }}
        anchor={isHomeRoute ? 'right' : 'left'}
        slotProps={{ paper: { className: isHomeRoute ? homeDesign.theme : undefined } }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: isHomeRoute ? 'var(--home-paper)' : 'background.default',
            borderColor: isHomeRoute ? 'var(--home-rule)' : 'divider',
            ...(isHomeRoute && {
              borderRadius: '24px 0 0 24px',
              '& .MuiListItemButton-root': {
                minHeight: 48,
                borderRadius: '999px',
                color: 'var(--home-ink)',
              },
              '& .MuiListItemButton-root.Mui-selected': { bgcolor: 'var(--home-subtle)' },
            }),
          },
        }}
      >
        <Toolbar sx={{ minHeight: headerHeight }} />
        <SidebarContent isAdminUser={isAdminUser} onNavigate={toggleMobileNav} />
      </Drawer>

      <Box
        component="main"
        sx={{
          width: '100%',
          boxSizing: 'border-box',
          px: isHomeRoute ? 0 : { xs: 1.5, sm: 2, md: 3 },
          py: isHomeRoute ? 0 : { xs: 1.5, md: 2 },
          pt: isHomeRoute
            ? 'var(--home-header-height)'
            : {
                xs: `${headerHeight + 16}px`,
                md: `${headerHeight + 20}px`,
              },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

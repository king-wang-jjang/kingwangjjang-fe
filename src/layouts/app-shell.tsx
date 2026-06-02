'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

import MenuIcon from '@mui/icons-material/Menu';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';

import SocialLoginButtons from 'src/auth/components/form-oauth';

const drawerWidth = 236;
const headerHeight = 58;

type Props = {
  children: React.ReactNode;
};

const navItems = [
  {
    label: '실시간 게시판',
    href: '/board',
    icon: <ArticleOutlinedIcon fontSize="small" />,
  },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <Box sx={{ px: 1.5, py: 2 }}>
      <Box sx={{ px: 1, pb: 2.5 }}>
        <Typography variant="overline" color="text.secondary">
          Workspace
        </Typography>
      </Box>

      {navItems.map((item) => {
        const selected = pathname === item.href;

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
              color: selected ? '#23251d' : 'text.primary',
              border: 1,
              borderColor: selected ? '#bfc1b7' : 'transparent',
              bgcolor: selected ? '#e5e7e0' : 'transparent',
              '&:hover': {
                bgcolor: '#f4f4f4',
                color: '#F54E00',
                '& .MuiListItemIcon-root': {
                  color: '#F54E00',
                },
              },
              '&.Mui-selected': {
                bgcolor: '#e5e7e0',
                color: '#23251d',
                '& .MuiListItemIcon-root': {
                  color: '#23251d',
                },
                '&:hover': {
                  bgcolor: '#f4f4f4',
                  color: '#F54E00',
                },
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 34,
                color: selected ? '#23251d' : 'text.secondary',
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

export function AppShell({ children }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileNav = () => {
    setMobileOpen((open) => !open);
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}
    >
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: 'text.primary',
          bgcolor: 'background.default',
          borderBottom: 1,
          borderColor: '#bfc1b7',
          boxShadow: 'none',
        }}
      >
        <Toolbar
          sx={{
            minHeight: headerHeight,
            px: { xs: 1.5, md: 3 },
            justifyContent: 'space-between',
          }}
        >
          <Box
            component={Link}
            href="/board"
            aria-label="홈으로 이동"
            sx={{
              width: 40,
              height: 40,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Box
              component="img"
              src="/logo/logo-single.svg"
              alt="Kingwangjjang"
              sx={{ width: '100%', height: '100%', display: 'block' }}
            />
          </Box>

          <Box
            className="header-login-actions"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 1,
              flexShrink: 0,
            }}
          >
            <SocialLoginButtons />

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
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: 'background.default',
            borderColor: '#bfc1b7',
          },
        }}
      >
        <Toolbar sx={{ minHeight: headerHeight }} />
        <SidebarContent onNavigate={toggleMobileNav} />
      </Drawer>

      <Box
        component="main"
        sx={{
          width: '100%',
          boxSizing: 'border-box',
          px: { xs: 1.5, sm: 2, md: 3 },
          py: { xs: 1.5, md: 2 },
          pt: {
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

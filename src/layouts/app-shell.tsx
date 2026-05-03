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

const drawerWidth = 232;
const headerHeight = 64;

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
              minHeight: 44,
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiListItemIcon-root': {
                  color: 'primary.contrastText',
                },
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: 34, color: 'text.secondary' }}>{item.icon}</ListItemIcon>
            <ListItemText
              primary={item.label}
              primaryTypographyProps={{ variant: 'body2', fontWeight: 700 }}
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
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: 'text.primary',
          bgcolor: 'background.paper',
        }}
      >
        <Toolbar
          sx={{
            minHeight: headerHeight,
            px: { xs: 2, md: 5 },
            borderBottom: 1,
            borderColor: 'divider',
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

          <IconButton
            onClick={toggleMobileNav}
            aria-label="메뉴 열기"
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
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
          },
        }}
      >
        <Toolbar sx={{ minHeight: headerHeight }} />
        <SidebarContent onNavigate={toggleMobileNav} />
      </Drawer>

      <Box
        component="main"
        sx={{
          px: { xs: 2, sm: 2.5, md: 5 },
          py: { xs: 2, md: 3 },
          pt: {
            xs: `${headerHeight + 24}px`,
            md: `${headerHeight + 32}px`,
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

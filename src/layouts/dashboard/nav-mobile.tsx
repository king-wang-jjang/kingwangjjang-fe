import type { NavSectionProps } from 'src/components/nav-section';

import { useEffect } from 'react';

import Box from '@mui/material/Box';
import Drawer, { drawerClasses } from '@mui/material/Drawer';
import { useTheme, type Breakpoint } from '@mui/material/styles';

import { usePathname } from 'src/routes/hooks';

import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';

import SocialLoginButtons from 'src/auth/components/form-oauth';

import { _account } from '../config-nav-account';
import { AccountDrawer } from '../components/account-drawer';

// ----------------------------------------------------------------------

type NavMobileProps = NavSectionProps & {
  open: boolean;
  onClose: () => void;
  slots?: {
    topArea?: React.ReactNode;
    bottomArea?: React.ReactNode;
  };
};

export function NavMobile({ data, open, onClose, slots, sx, ...other }: NavMobileProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const layoutQuery: Breakpoint = 'md';

  useEffect(() => {
    if (open) {
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor="right"
      sx={{
        [`& .${drawerClasses.paper}`]: {
          overflow: 'unset',
          bgcolor: 'var(--layout-nav-bg)',
          width: 'var(--layout-nav-mobile-width)',
          ...sx,
        },
      }}
    >
      {slots?.topArea ?? (
        <Box sx={{ pl: 3.5, pt: 2.5, pb: 1 }}>
          <Logo />
        </Box>
      )}

      <Scrollbar fillContent>
        <AccountDrawer
          data={_account}
          sx={{
            display: 'flex',
            [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
          }}
        />
        {/* <NavSectionVertical data={data} sx={{ px: 2, flex: '1 1 auto' }} {...other} /> */}
        {/* <NavUpgrade /> */}
        <SocialLoginButtons />
      </Scrollbar>

      {slots?.bottomArea}
    </Drawer>
  );
}

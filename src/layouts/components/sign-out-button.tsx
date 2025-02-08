import type { ButtonProps } from '@mui/material/Button';
import type { Theme, SxProps } from '@mui/material/styles';

import Button from '@mui/material/Button';

import { useRouter } from 'src/routes/hooks';

// ----------------------------------------------------------------------

type Props = ButtonProps & {
  sx?: SxProps<Theme>;
  onClose?: () => void;
};

export function SignOutButton({ onClose, ...other }: Props) {
  const router = useRouter();

  // const { checkUserSession } = useAuthContext();

  // const handleLogout = useCallback(async () => {
  //   try {
  //     await signOut();
  //     await checkUserSession?.();

  //     onClose?.();
  //     router.refresh();
  //   } catch (error) {
  //     console.error(error);
  //   }
  // }, [checkUserSession, onClose, router]);

  return (
    <Button fullWidth variant="soft" size="large" color="error" {...other}>
      Logout
    </Button>
    // <Button fullWidth variant="soft" size="large" color="error" onClick={handleLogout} {...other}>
    //   Logout
    // </Button>
  );
}

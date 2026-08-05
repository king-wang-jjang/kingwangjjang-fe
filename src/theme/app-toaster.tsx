'use client';

import { Toaster } from 'sonner';

import { useColorScheme } from '@mui/material/styles';

export function AppToaster() {
  const { mode } = useColorScheme();

  return <Toaster richColors position="top-center" theme={mode ?? 'system'} />;
}

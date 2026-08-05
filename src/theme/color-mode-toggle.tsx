'use client';

import { Tooltip, IconButton } from '@mui/material';
import { useColorScheme } from '@mui/material/styles';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';

export function ColorModeToggle() {
  const { mode, systemMode, setMode } = useColorScheme();
  const resolvedMode = mode === 'system' ? systemMode : mode;
  const isDarkMode = resolvedMode === 'dark';
  const label = isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환';

  return (
    <Tooltip title={label}>
      <IconButton
        color="inherit"
        aria-label={label}
        onClick={() => setMode(isDarkMode ? 'light' : 'dark')}
        sx={{
          width: 38,
          height: 38,
          border: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        {isDarkMode ? (
          <LightModeOutlinedIcon fontSize="small" />
        ) : (
          <DarkModeOutlinedIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
}

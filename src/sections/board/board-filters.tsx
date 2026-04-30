import type { IBoardFilters } from 'src/types/board';
import type { UseSetStateReturn } from 'src/hooks/use-set-state';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Badge from '@mui/material/Badge';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Checkbox, FormControlLabel } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  canReset: boolean;
  onOpen: () => void;
  onClose: () => void;
  filters: UseSetStateReturn<IBoardFilters>;
  options: {
    site: string[];
  };
};

export function BoardFilters({ open, canReset, onOpen, onClose, filters, options }: Props) {
  const handleFilterSite = useCallback(
    (newValue: string) => {
      const checked = filters.state.site.includes(newValue)
        ? filters.state.site.filter((value: string) => value !== newValue)
        : [...filters.state.site, newValue];

      filters.setState({ site: checked });
    },
    [filters]
  );

  const renderHead = (
    <>
      <Box display="flex" alignItems="center" sx={{ py: 2, pr: 1, pl: 2.5 }}>
        <Typography variant="h6" sx={{ flexGrow: 1, color: '#23251d', fontWeight: 800 }}>
          Filters
        </Typography>

        <Tooltip title="Reset">
          <IconButton onClick={filters.onResetState}>
            <Badge color="error" variant="dot" invisible={!canReset}>
              <Iconify icon="solar:restart-bold" />
            </Badge>
          </IconButton>
        </Tooltip>

        <IconButton onClick={onClose}>
          <Iconify icon="mingcute:close-line" />
        </IconButton>
      </Box>

      <Divider sx={{ borderStyle: 'dashed', borderColor: '#bfc1b7' }} />
    </>
  );

  const renderSite = (
    <Box display="flex" flexDirection="column">
      <Typography variant="subtitle2" sx={{ mb: 1, color: '#23251d', fontWeight: 800 }}>
        Site
      </Typography>
      {options.site.map((option) => (
        <FormControlLabel
          key={option}
          control={
            <Checkbox
              checked={filters.state.site.includes(option)}
              onClick={() => handleFilterSite(option)}
              sx={{
                color: '#bfc1b7',
                '&.Mui-checked': { color: '#F54E00' },
              }}
            />
          }
          label={option}
          sx={{
            m: 0,
            px: 1,
            py: 0.25,
            borderRadius: '4px',
            color: '#4d4f46',
            '&:hover': {
              bgcolor: '#f4f4f4',
              color: '#F54E00',
            },
            '& .MuiFormControlLabel-label': {
              fontSize: 14,
              fontWeight: 600,
            },
          }}
        />
      ))}
    </Box>
  );

  return (
    <>
      <Button
        disableRipple
        color="inherit"
        endIcon={
          <Badge color="error" variant="dot" invisible={!canReset}>
            <Iconify icon="ic:round-filter-list" />
          </Badge>
        }
        onClick={onOpen}
        sx={{
          height: 34,
          px: 1.5,
          border: '1px solid #bfc1b7',
          borderRadius: '4px',
          bgcolor: '#eeefe9',
          color: '#4d4f46',
          fontWeight: 800,
          '&:hover': {
            bgcolor: '#f4f4f4',
            color: '#F54E00',
          },
        }}
      >
        Filters
      </Button>

      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        slotProps={{ backdrop: { invisible: true } }}
        PaperProps={{
          sx: {
            width: 320,
            bgcolor: '#fdfdf8',
            color: '#4d4f46',
            borderLeft: '1px solid #bfc1b7',
          },
        }}
      >
        {renderHead}

        <Scrollbar sx={{ px: 2.5, py: 3 }}>
          <Stack spacing={3}>{renderSite}</Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}

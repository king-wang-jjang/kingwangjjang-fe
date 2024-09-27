import type { IBoardFilters } from 'src/types/board';
import type { Theme, SxProps } from '@mui/material/styles';
import type { UseSetStateReturn } from 'src/hooks/use-set-state';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

type Props = {
  totalResults: number;
  sx?: SxProps<Theme>;
  filters: UseSetStateReturn<IBoardFilters>;
};

export function BoardFiltersResult({ filters, totalResults, sx }: Props) {
  const handleRemoveSite = (inputValue: string) => {
    const newValue = filters.state.site.filter((item) => item !== inputValue);
    filters.setState({ site: newValue });
  };

  return (
    <FiltersResult totalResults={totalResults} onReset={filters.onResetState} sx={sx}>
      <FiltersBlock label="Site:" isShow={!!filters.state.site.length}>
        {filters.state.site.map((item) => (
          <Chip {...chipProps} key={item} label={item} onDelete={() => handleRemoveSite(item)} />
        ))}
      </FiltersBlock>
    </FiltersResult>
  );
}

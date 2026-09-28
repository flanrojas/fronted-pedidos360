import GridViewIcon from '@mui/icons-material/GridView'
import SearchIcon from '@mui/icons-material/Search'
import ViewListIcon from '@mui/icons-material/ViewList'
import {
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material'
import type { ProductStatusFilter } from '../types'

export type CatalogView = 'grid' | 'list'

interface CatalogToolbarProps {
  search: string
  onSearchChange: (value: string) => void
  status: ProductStatusFilter
  onStatusChange: (value: ProductStatusFilter) => void
  view: CatalogView
  onViewChange: (value: CatalogView) => void
}

export function CatalogToolbar({
  search,
  onSearchChange,
  status,
  onStatusChange,
  view,
  onViewChange,
}: CatalogToolbarProps) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
      <TextField
        label="Buscar por nombre o SKU"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
        size="small"
        sx={{ flexGrow: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      <TextField
        select
        label="Estado"
        value={status}
        onChange={(event) => onStatusChange(event.target.value as ProductStatusFilter)}
        size="small"
        sx={{ minWidth: 160 }}
      >
        <MenuItem value="all">Todos</MenuItem>
        <MenuItem value="active">Activos</MenuItem>
        <MenuItem value="inactive">Inactivos</MenuItem>
      </TextField>
      <ToggleButtonGroup
        exclusive
        size="small"
        value={view}
        onChange={(_, value: CatalogView | null) => {
          if (value) onViewChange(value)
        }}
        aria-label="Tipo de vista"
        sx={{ alignSelf: { xs: 'flex-start', sm: 'auto' } }}
      >
        <ToggleButton value="grid" aria-label="Vista de tarjetas">
          <GridViewIcon />
        </ToggleButton>
        <ToggleButton value="list" aria-label="Vista de lista">
          <ViewListIcon />
        </ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  )
}

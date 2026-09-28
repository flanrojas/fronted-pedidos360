import { Box, Skeleton, Stack } from '@mui/material'
import type { CatalogView } from './CatalogToolbar'
import { PRODUCT_GRID_SX } from './productGridSx'

interface CatalogSkeletonProps {
  view: CatalogView
}

export function CatalogSkeleton({ view }: CatalogSkeletonProps) {
  const items = Array.from({ length: 6 }, (_, i) => i)

  if (view === 'list') {
    return (
      <Stack spacing={1} aria-label="Cargando productos">
        {items.map((i) => (
          <Skeleton key={i} variant="rounded" height={44} />
        ))}
      </Stack>
    )
  }

  return (
    <Box sx={PRODUCT_GRID_SX} aria-label="Cargando productos">
      {items.map((i) => (
        <Skeleton key={i} variant="rounded" height={170} />
      ))}
    </Box>
  )
}

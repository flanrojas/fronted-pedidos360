import { Chip, Stack } from '@mui/material'
import type { Product } from '../types'

interface ProductStatusChipsProps {
  product: Pick<Product, 'stock' | 'active'>
}

export function ProductStatusChips({ product }: ProductStatusChipsProps) {
  if (product.active && product.stock > 0) return null

  return (
    <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
      {!product.active && <Chip label="Inactivo" size="small" />}
      {product.stock === 0 && <Chip label="Sin stock" size="small" color="warning" />}
    </Stack>
  )
}

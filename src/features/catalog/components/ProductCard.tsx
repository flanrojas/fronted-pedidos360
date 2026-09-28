import { Box, Card, CardActions, CardContent, Stack, Typography } from '@mui/material'
import { formatCLP } from '@/shared/utils/formatCurrency'
import type { Product } from '../types'
import { ProductActions } from './ProductActions'
import { ProductImage } from './ProductImage'
import { ProductStatusChips } from './ProductStatusChips'

interface ProductCardProps {
  product: Product
  canManage: boolean
  onAdjustStock: (product: Product) => void
  onToggleActive: (product: Product) => void
}

export function ProductCard({
  product,
  canManage,
  onAdjustStock,
  onToggleActive,
}: ProductCardProps) {
  return (
    <Card
      component="article"
      aria-label={product.name}
      sx={{ display: 'flex', flexDirection: 'column', opacity: product.active ? 1 : 0.7 }}
    >
      <ProductImage src={product.imageUrl} alt={product.name} sx={{ aspectRatio: '4 / 3' }} />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="overline" color="text.secondary">
          {product.sku}
        </Typography>
        <Typography variant="h6" component="h2" sx={{ lineHeight: 1.3, mb: 1 }}>
          {product.name}
        </Typography>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
          <Typography variant="h6" component="p" color="primary">
            {formatCLP(product.price)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Stock: {product.stock}
          </Typography>
        </Stack>
        <Box sx={{ mt: 1 }}>
          <ProductStatusChips product={product} />
        </Box>
      </CardContent>
      {canManage && (
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <ProductActions
            product={product}
            onAdjustStock={onAdjustStock}
            onToggleActive={onToggleActive}
          />
        </CardActions>
      )}
    </Card>
  )
}

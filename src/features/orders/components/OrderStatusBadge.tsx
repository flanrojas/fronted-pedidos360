import { Chip, type ChipProps } from '@mui/material'
import { BRAND } from '@/app/theme'
import { STATUS_LABELS, type OrderStatus } from '../types'

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: ChipProps['size']
}

export function OrderStatusBadge({ status, size = 'small' }: OrderStatusBadgeProps) {
  const outlined = status === 'CANCELLED'

  return (
    <Chip
      label={STATUS_LABELS[status]}
      size={size}
      variant={outlined ? 'outlined' : 'filled'}
      sx={{
        bgcolor: outlined ? 'transparent' : BRAND.goldDark,
        color: outlined ? BRAND.goldDark : 'primary.contrastText',
        borderColor: outlined ? BRAND.goldDark : undefined,
      }}
    />
  )
}

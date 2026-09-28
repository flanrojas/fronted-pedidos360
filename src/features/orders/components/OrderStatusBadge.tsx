import { Chip, type ChipProps } from '@mui/material'
import { STATUS_LABELS, type OrderStatus } from '../types'

const STATUS_COLORS: Record<OrderStatus, ChipProps['color']> = {
  CREATED: 'info',
  ACCEPTED: 'primary',
  PREPARING: 'warning',
  DISPATCHED: 'secondary',
  DELIVERED: 'success',
  CANCELLED: 'error',
}

interface OrderStatusBadgeProps {
  status: OrderStatus
  size?: ChipProps['size']
}

export function OrderStatusBadge({ status, size = 'small' }: OrderStatusBadgeProps) {
  return (
    <Chip
      label={STATUS_LABELS[status]}
      color={STATUS_COLORS[status]}
      size={size}
      variant={status === 'CANCELLED' ? 'outlined' : 'filled'}
    />
  )
}

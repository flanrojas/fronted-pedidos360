import { Button, Stack } from '@mui/material'
import type { OrderStatus } from '../types'
import { getAllowedTransitions } from '../utils/orderStateMachine'

const ACTION_LABELS: Record<OrderStatus, string> = {
  CREATED: 'Crear',
  ACCEPTED: 'Aceptar',
  PREPARING: 'Pasar a preparación',
  DISPATCHED: 'Despachar',
  DELIVERED: 'Marcar como entregado',
  CANCELLED: 'Cancelar pedido',
}

interface OrderStatusActionsProps {
  status: OrderStatus
  /** Target status currently being applied (shows a spinner on that button). */
  pendingStatus?: OrderStatus
  onAction: (to: OrderStatus) => void
}

/** One button per transition allowed from `status` by the state machine. */
export function OrderStatusActions({ status, pendingStatus, onAction }: OrderStatusActionsProps) {
  const transitions = getAllowedTransitions(status)
  if (transitions.length === 0) return null

  return (
    <Stack
      direction="row"
      role="group"
      aria-label="Cambiar estado"
      sx={{ flexWrap: 'wrap', gap: 1 }}
    >
      {transitions.map((to) => (
        <Button
          key={to}
          variant={to === 'CANCELLED' ? 'outlined' : 'contained'}
          color={to === 'CANCELLED' ? 'error' : 'primary'}
          onClick={() => onAction(to)}
          disabled={pendingStatus !== undefined && pendingStatus !== to}
          loading={pendingStatus === to}
        >
          {ACTION_LABELS[to]}
        </Button>
      ))}
    </Stack>
  )
}

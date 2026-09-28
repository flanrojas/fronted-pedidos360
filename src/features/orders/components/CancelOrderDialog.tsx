import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import type { Order } from '../types'

interface CancelOrderDialogProps {
  order: Order
  open: boolean
  submitting: boolean
  onConfirm: () => void
  onClose: () => void
}

export function CancelOrderDialog({
  order,
  open,
  submitting,
  onConfirm,
  onClose,
}: CancelOrderDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Cancelar pedido</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Cancelar el pedido N° {order.id} de {order.customerName}? Esta acción no se puede
          deshacer.
          {order.status === 'ACCEPTED' && ' El stock reservado se devolverá al catálogo.'}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Volver</Button>
        <Button variant="contained" color="error" onClick={onConfirm} loading={submitting}>
          Cancelar pedido
        </Button>
      </DialogActions>
    </Dialog>
  )
}

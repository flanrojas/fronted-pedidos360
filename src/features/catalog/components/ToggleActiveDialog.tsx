import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { useNotify } from '@/shared/notifications/useNotify'
import { useSetProductActive } from '../hooks/useProducts'
import type { Product } from '../types'

interface ToggleActiveDialogProps {
  product: Product
  onClose: () => void
}

export function ToggleActiveDialog({ product, onClose }: ToggleActiveDialogProps) {
  const setActive = useSetProductActive()
  const notify = useNotify()
  const deactivating = product.active

  const handleConfirm = () => {
    setActive.mutate(
      { id: product.id, active: !product.active },
      {
        onSuccess: () => {
          notify.success(
            `«${product.name}» ${deactivating ? 'desactivado' : 'activado'} correctamente.`,
          )
          onClose()
        },
        onError: (error) =>
          notify.error(`No se pudo ${deactivating ? 'desactivar' : 'activar'} el producto.`, error),
      },
    )
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>{deactivating ? 'Desactivar producto' : 'Activar producto'}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          {deactivating
            ? `¿Desactivar «${product.name}»? No estará disponible para nuevos pedidos, pero no se borra y puedes reactivarlo después.`
            : `¿Activar «${product.name}»? Volverá a estar disponible para nuevos pedidos.`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color={deactivating ? 'error' : 'success'}
          onClick={handleConfirm}
          loading={setActive.isPending}
        >
          {deactivating ? 'Desactivar' : 'Activar'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

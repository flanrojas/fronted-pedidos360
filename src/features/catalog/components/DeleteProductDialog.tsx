import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { useNotify } from '@/shared/notifications/useNotify'
import { useDeleteProduct } from '../hooks/useProducts'
import type { Product } from '../types'

interface DeleteProductDialogProps {
  product: Product
  onClose: () => void
}

/** Confirmation before a permanent delete (Administrador only). */
export function DeleteProductDialog({ product, onClose }: DeleteProductDialogProps) {
  const deleteProduct = useDeleteProduct()
  const notify = useNotify()

  const handleConfirm = () => {
    deleteProduct.mutate(product.id, {
      onSuccess: () => {
        notify.success(`«${product.name}» eliminado del catálogo.`)
        onClose()
      },
      onError: (error) => notify.error('No se pudo eliminar el producto.', error),
    })
  }

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Eliminar producto</DialogTitle>
      <DialogContent>
        <DialogContentText>
          ¿Eliminar «{product.name}» del catálogo? Esta acción no se puede deshacer. Los pedidos que
          ya lo incluyen conservan su nombre y precio.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleConfirm}
          loading={deleteProduct.isPending}
        >
          Eliminar
        </Button>
      </DialogActions>
    </Dialog>
  )
}

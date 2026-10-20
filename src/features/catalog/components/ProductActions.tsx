import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import EditIcon from '@mui/icons-material/Edit'
import InventoryIcon from '@mui/icons-material/Inventory'
import ToggleOffIcon from '@mui/icons-material/ToggleOff'
import ToggleOnIcon from '@mui/icons-material/ToggleOn'
import { IconButton, Stack, Tooltip } from '@mui/material'
import { Link } from 'react-router'
import { apiCapabilities } from '@/shared/api/apiMode'
import type { Product } from '../types'

interface ProductActionsProps {
  product: Product
  onAdjustStock: (product: Product) => void
  onToggleActive: (product: Product) => void
  /** Only passed for roles allowed to delete (catalog:delete). */
  onDelete?: (product: Product) => void
}

export function ProductActions({
  product,
  onAdjustStock,
  onToggleActive,
  onDelete,
}: ProductActionsProps) {
  const toggleLabel = product.active ? 'Desactivar' : 'Activar'
  const { catalog } = apiCapabilities()

  return (
    <Stack direction="row" spacing={0.5}>
      {catalog.edit && (
        <Tooltip title="Editar">
          <IconButton
            component={Link}
            to={`/catalog/${product.id}/edit`}
            aria-label={`Editar ${product.name}`}
            size="small"
            color="secondary"
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      <Tooltip title="Ajustar stock">
        <IconButton
          onClick={() => onAdjustStock(product)}
          aria-label={`Ajustar stock de ${product.name}`}
          size="small"
          color="secondary"
        >
          <InventoryIcon fontSize="small" />
        </IconButton>
      </Tooltip>
      {catalog.toggleActive && (
        <Tooltip title={toggleLabel}>
          <IconButton
            onClick={() => onToggleActive(product)}
            aria-label={`${toggleLabel} ${product.name}`}
            size="small"
            color="secondary"
          >
            {product.active ? (
              <ToggleOnIcon fontSize="small" />
            ) : (
              <ToggleOffIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>
      )}
      {onDelete && (
        <Tooltip title="Eliminar">
          <IconButton
            onClick={() => onDelete(product)}
            aria-label={`Eliminar ${product.name}`}
            size="small"
            color="error"
          >
            <DeleteOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Stack>
  )
}

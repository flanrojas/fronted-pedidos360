import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { formatCLP } from '@/shared/utils/formatCurrency'
import type { Product } from '../types'
import { ProductActions } from './ProductActions'
import { ProductImage } from './ProductImage'
import { ProductStatusChips } from './ProductStatusChips'

interface ProductTableProps {
  products: readonly Product[]
  canManage: boolean
  onAdjustStock: (product: Product) => void
  onToggleActive: (product: Product) => void
  onDelete?: (product: Product) => void
}

export function ProductTable({
  products,
  canManage,
  onAdjustStock,
  onToggleActive,
  onDelete,
}: ProductTableProps) {
  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table size="small" aria-label="Listado de productos" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 64 }}>Foto</TableCell>
            <TableCell>SKU</TableCell>
            <TableCell>Nombre</TableCell>
            <TableCell align="right">Precio</TableCell>
            <TableCell align="right">Stock</TableCell>
            <TableCell>Estado</TableCell>
            {canManage && <TableCell align="right">Acciones</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} hover>
              <TableCell>
                <ProductImage
                  src={product.imageUrl}
                  alt={product.name}
                  sx={{ width: 48, height: 48, borderRadius: 1, fontSize: 10 }}
                />
              </TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{product.sku}</TableCell>
              <TableCell>{product.name}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                {formatCLP(product.price)}
              </TableCell>
              <TableCell align="right">{product.stock}</TableCell>
              <TableCell>
                <ProductStatusChips product={product} />
              </TableCell>
              {canManage && (
                <TableCell align="right">
                  <ProductActions
                    product={product}
                    onAdjustStock={onAdjustStock}
                    onToggleActive={onToggleActive}
                    onDelete={onDelete}
                  />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

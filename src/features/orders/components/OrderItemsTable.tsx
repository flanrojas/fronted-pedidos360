import {
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ProductImage } from '@/features/catalog/components/ProductImage'
import type { EntityId } from '@/shared/utils/entityId'
import { formatCLP } from '@/shared/utils/formatCurrency'
import type { OrderItem } from '../types'
import { calculateSubtotal } from '../utils/orderTotals'

interface OrderItemsTableProps {
  items: readonly OrderItem[]
  total: number
  imagesByProductId?: ReadonlyMap<EntityId, string | undefined>
}

export function OrderItemsTable({ items, total, imagesByProductId }: OrderItemsTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
      <Table size="small" aria-label="Ítems del pedido">
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
              Precio unitario
            </TableCell>
            <TableCell align="right">Cantidad</TableCell>
            <TableCell align="right">Subtotal</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.productId}>
              <TableCell>
                <Stack direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
                  <ProductImage
                    src={imagesByProductId?.get(item.productId)}
                    alt={item.productName}
                    sx={{ width: 40, height: 40, borderRadius: 1, fontSize: 9 }}
                  />
                  <div>
                    {item.productName}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: { xs: 'block', sm: 'none' } }}
                    >
                      {item.priceKnown === false ? 'Precio no registrado' : `${formatCLP(item.unitPrice)} c/u`}
                    </Typography>
                  </div>
                </Stack>
              </TableCell>
              <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                {item.priceKnown === false ? '—' : formatCLP(item.unitPrice)}
              </TableCell>
              <TableCell align="right">{item.quantity}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                {item.priceKnown === false ? '—' : formatCLP(calculateSubtotal(item))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} />
            <TableCell colSpan={2} align="right">
              <Typography sx={{ fontWeight: 600 }}>Total</Typography>
            </TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
              <Typography sx={{ fontWeight: 600 }} aria-label="Total del pedido">
                {items.some((item) => item.priceKnown === false) ? '—' : formatCLP(total)}
              </Typography>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

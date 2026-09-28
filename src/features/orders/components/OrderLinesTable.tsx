import DeleteIcon from '@mui/icons-material/Delete'
import {
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import type { FieldArrayWithId, FieldErrors, UseFormRegister } from 'react-hook-form'
import { ProductImage } from '@/features/catalog/components/ProductImage'
import type { Product } from '@/features/catalog/types'
import { formatCLP } from '@/shared/utils/formatCurrency'
import type { OrderFormValues } from '../schemas/orderFormSchema'
import { calculateSubtotal } from '../utils/orderTotals'

interface OrderLinesTableProps {
  fields: FieldArrayWithId<OrderFormValues, 'items'>[]
  /** Current (watched) quantities, index-aligned with `fields`. */
  quantities: readonly number[]
  productsById: ReadonlyMap<number, Product>
  register: UseFormRegister<OrderFormValues>
  errors: FieldErrors<OrderFormValues>['items']
  total: number
  onRemove: (index: number) => void
}

export function OrderLinesTable({
  fields,
  quantities,
  productsById,
  register,
  errors,
  total,
  onRemove,
}: OrderLinesTableProps) {
  return (
    <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
      <Table size="small" aria-label="Productos del pedido">
        <TableHead>
          <TableRow>
            <TableCell>Producto</TableCell>
            <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
              Precio unitario
            </TableCell>
            <TableCell align="right" sx={{ width: { xs: 88, sm: 140 } }}>
              Cantidad
            </TableCell>
            <TableCell align="right">Subtotal</TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {fields.map((field, index) => {
            const product = productsById.get(field.productId)
            if (!product) return null
            const quantity = quantities[index]
            const validQuantity = Number.isInteger(quantity) && quantity > 0
            const exceedsStock = validQuantity && quantity > product.stock
            const lineError = errors?.[index]?.quantity?.message

            return (
              <TableRow key={field.id}>
                <TableCell>
                  <Stack direction="row" sx={{ alignItems: 'flex-start', gap: 1.5 }}>
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 1,
                        fontSize: 9,
                        display: { xs: 'none', sm: 'flex' },
                      }}
                    />
                    <div>
                      <Typography variant="body2">{product.name}</Typography>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: { xs: 'block', sm: 'none' } }}
                      >
                        {formatCLP(product.price)} c/u
                      </Typography>
                      {exceedsStock && (
                        <Typography
                          variant="caption"
                          color="warning.main"
                          role="status"
                          sx={{ display: 'block' }}
                        >
                          Supera el stock actual ({product.stock}). Se validará al aceptar el
                          pedido.
                        </Typography>
                      )}
                    </div>
                  </Stack>
                </TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                  {formatCLP(product.price)}
                </TableCell>
                <TableCell align="right">
                  <TextField
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    type="number"
                    size="small"
                    error={!!lineError}
                    helperText={lineError}
                    slotProps={{
                      htmlInput: {
                        min: 1,
                        step: 1,
                        'aria-label': `Cantidad de ${product.name}`,
                      },
                    }}
                  />
                </TableCell>
                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  {validQuantity
                    ? formatCLP(calculateSubtotal({ quantity, unitPrice: product.price }))
                    : '—'}
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Quitar">
                    <IconButton
                      aria-label={`Quitar ${product.name}`}
                      size="small"
                      onClick={() => onRemove(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }} />
            <TableCell colSpan={2} align="right">
              <Typography sx={{ fontWeight: 600 }}>Total</Typography>
            </TableCell>
            <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
              <Typography sx={{ fontWeight: 600 }} aria-label="Total del pedido">
                {formatCLP(total)}
              </Typography>
            </TableCell>
            <TableCell />
          </TableRow>
        </TableFooter>
      </Table>
    </TableContainer>
  )
}

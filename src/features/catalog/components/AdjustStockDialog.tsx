import { zodResolver } from '@hookform/resolvers/zod'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { useNotify } from '@/shared/notifications/useNotify'
import { useAdjustProductStock } from '../hooks/useProducts'
import { createAdjustStockSchema, type AdjustStockFormValues } from '../schemas/adjustStockSchema'
import type { Product } from '../types'
import { applyStockAdjustment } from '../utils/stockAdjustment'

interface AdjustStockDialogProps {
  product: Product
  onClose: () => void
}

export function AdjustStockDialog({ product, onClose }: AdjustStockDialogProps) {
  const adjustStock = useAdjustProductStock()
  const notify = useNotify()
  const schema = useMemo(() => createAdjustStockSchema(product.stock), [product.stock])
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdjustStockFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { mode: 'add' },
  })

  const [mode, quantity] = useWatch({ control, name: ['mode', 'quantity'] })
  const preview =
    Number.isInteger(quantity) && quantity > 0
      ? applyStockAdjustment(product.stock, mode, quantity)
      : product.stock

  const onSubmit = (values: AdjustStockFormValues) => {
    const stock = applyStockAdjustment(product.stock, values.mode, values.quantity)
    adjustStock.mutate(
      { product, delta: stock - product.stock },
      {
        onSuccess: (updated) => {
          notify.success(`Stock de «${product.name}» actualizado a ${updated.stock}.`)
          onClose()
        },
        onError: (error) => notify.error('No se pudo ajustar el stock.', error),
      },
    )
  }

  const { ref: quantityRef, ...quantityField } = register('quantity', { valueAsNumber: true })

  return (
    <Dialog open onClose={onClose} fullWidth maxWidth="xs">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>Ajustar stock</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography>
              {product.name} — stock actual: <strong>{product.stock}</strong>
            </Typography>
            <Controller
              control={control}
              name="mode"
              render={({ field }) => (
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  size="small"
                  value={field.value}
                  onChange={(_, value: AdjustStockFormValues['mode'] | null) => {
                    if (value) field.onChange(value)
                  }}
                  aria-label="Tipo de ajuste"
                >
                  <ToggleButton value="add">Sumar</ToggleButton>
                  <ToggleButton value="subtract">Restar</ToggleButton>
                </ToggleButtonGroup>
              )}
            />
            <TextField
              {...quantityField}
              inputRef={quantityRef}
              label="Cantidad"
              type="number"
              autoFocus
              error={!!errors.quantity}
              helperText={errors.quantity?.message}
              slotProps={{ htmlInput: { min: 1, step: 1 } }}
            />
            <Typography color={preview < 0 ? 'error' : 'text.secondary'}>
              Stock resultante: <strong>{preview}</strong>
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" loading={adjustStock.isPending}>
            Guardar
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

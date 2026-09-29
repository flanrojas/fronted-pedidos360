import { zodResolver } from '@hookform/resolvers/zod'
import { Alert, Button, Stack, TextField, Typography } from '@mui/material'
import { useMemo } from 'react'
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import type { User } from '@/auth/types'
import type { Product } from '@/features/catalog/types'
import type { EntityId } from '@/shared/utils/entityId'
import { orderFormSchema, type OrderFormValues } from '../schemas/orderFormSchema'
import { calculateTotal } from '../utils/orderTotals'
import { OrderLinesTable } from './OrderLinesTable'
import { ProductPicker } from './ProductPicker'

interface OrderFormProps {
  products: readonly Product[]
  fixedCustomer?: User
  submitting: boolean
  onSubmit: (values: OrderFormValues) => void
}

export function OrderForm({
  products,
  fixedCustomer,
  submitting,
  onSubmit,
}: OrderFormProps) {
  const {
    control,
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: { customerId: fixedCustomer?.id, items: [] },
  })
  const { fields, append, update, remove } = useFieldArray({ control, name: 'items' })
  const items = useWatch({ control, name: 'items' })

  const productsById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const activeProducts = useMemo(() => products.filter((p) => p.active), [products])

  const quantities = items.map((item) => item.quantity)
  const total = calculateTotal(
    items.flatMap((item) => {
      const product = productsById.get(item.productId)
      const valid = Number.isInteger(item.quantity) && item.quantity > 0
      return product && valid ? [{ quantity: item.quantity, unitPrice: product.price }] : []
    }),
  )

  const handleAdd = (productId: EntityId, quantity: number) => {
    const current = getValues('items')
    const index = current.findIndex((item) => item.productId === productId)
    if (index === -1) {
      append({ productId, quantity })
    } else {
      const previous = Number.isInteger(current[index].quantity) ? current[index].quantity : 0
      update(index, { productId, quantity: previous + quantity })
    }
  }

  const itemsError = errors.items?.message ?? errors.items?.root?.message

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Formulario de pedido">
      <Stack spacing={3}>
        {fixedCustomer ? (
          <Typography>
            Cliente: <strong>{fixedCustomer.name}</strong>
          </Typography>
        ) : (
          <Controller
            control={control}
            name="customerId"
            render={({ field }) => (
              <TextField
                label="ID del cliente"
                required
                value={field.value ?? ''}
                onChange={(event) => field.onChange(event.target.value.trim())}
                onBlur={field.onBlur}
                inputRef={field.ref}
                error={!!errors.customerId}
                helperText={errors.customerId?.message ?? 'Ingresa el identificador del cliente en el backend.'}
                sx={{ maxWidth: 360 }}
              />
            )}
          />
        )}

        <ProductPicker products={activeProducts} onAdd={handleAdd} />

        {fields.length > 0 ? (
          <OrderLinesTable
            fields={fields}
            quantities={quantities}
            productsById={productsById}
            register={register}
            errors={errors.items}
            total={total}
            onRemove={remove}
          />
        ) : (
          <Typography color="text.secondary">Aún no hay productos en el pedido.</Typography>
        )}

        {itemsError && <Alert severity="error">{itemsError}</Alert>}

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button component={Link} to="/orders">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={submitting}>
            Crear pedido
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { Button, InputAdornment, Stack, TextField } from '@mui/material'
import { useMemo } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { apiCapabilities } from '@/shared/api/apiMode'
import { createProductSchema, type ProductFormValues } from '../schemas/productSchema'
import type { Product } from '../types'
import { ProductImageField } from './ProductImageField'

interface ProductFormProps {
  product?: Product
  existingProducts: readonly Product[]
  submitting: boolean
  onSubmit: (values: ProductFormValues) => void
}

export function ProductForm({ product, existingProducts, submitting, onSubmit }: ProductFormProps) {
  const isEdit = product !== undefined
  const { extendedFields } = apiCapabilities().catalog
  const schema = useMemo(
    () => createProductSchema(existingProducts, product?.id, { requireSku: extendedFields }),
    [existingProducts, product?.id, extendedFields],
  )
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(schema),
    defaultValues: product
      ? {
          sku: product.sku,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          imageUrl: product.imageUrl ?? '',
        }
      : { sku: '', name: '', description: '', stock: 0, imageUrl: '' },
  })
  const name = useWatch({ control, name: 'name' })

  const { ref: skuRef, ...skuField } = register('sku')
  const { ref: nameRef, ...nameField } = register('name')
  const { ref: descriptionRef, ...descriptionField } = register('description')
  const { ref: priceRef, ...priceField } = register('price', { valueAsNumber: true })
  const { ref: stockRef, ...stockField } = register('stock', { valueAsNumber: true })

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate aria-label="Formulario de producto">
      <Stack spacing={2}>
        {extendedFields && (
          <TextField
            {...skuField}
            inputRef={skuRef}
            label="SKU"
            required
            error={!!errors.sku}
            helperText={errors.sku?.message}
          />
        )}
        <TextField
          {...nameField}
          inputRef={nameRef}
          label="Nombre"
          required
          error={!!errors.name}
          helperText={errors.name?.message}
        />
        {extendedFields && (
          <TextField
            {...descriptionField}
            inputRef={descriptionRef}
            label="Descripción"
            multiline
            minRows={2}
            error={!!errors.description}
            helperText={errors.description?.message}
          />
        )}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            {...priceField}
            inputRef={priceRef}
            label="Precio (CLP)"
            type="number"
            required
            fullWidth
            error={!!errors.price}
            helperText={errors.price?.message}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
              htmlInput: { min: 1, step: 1 },
            }}
          />
          <TextField
            {...stockField}
            inputRef={stockRef}
            label="Stock"
            type="number"
            required={!isEdit}
            fullWidth
            error={!!errors.stock}
            helperText={
              errors.stock?.message ?? (isEdit ? 'Usa «Ajustar stock» en el catálogo' : undefined)
            }
            slotProps={{ htmlInput: { min: 0, step: 1, readOnly: isEdit } }}
          />
        </Stack>

        {extendedFields && (
          <Controller
            control={control}
            name="imageUrl"
            render={({ field }) => (
              <ProductImageField
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                error={errors.imageUrl?.message}
                productName={name}
              />
            )}
          />
        )}

        <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
          <Button component={Link} to="/catalog">
            Cancelar
          </Button>
          <Button type="submit" variant="contained" loading={submitting}>
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </Stack>
      </Stack>
    </form>
  )
}

import AddIcon from '@mui/icons-material/Add'
import {
  Autocomplete,
  Box,
  Button,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { ProductImage } from '@/features/catalog/components/ProductImage'
import type { Product } from '@/features/catalog/types'
import { formatCLP } from '@/shared/utils/formatCurrency'

interface ProductPickerProps {
  /** Only active products should be passed. */
  products: readonly Product[]
  onAdd: (productId: number, quantity: number) => void
}

export function ProductPicker({ products, onAdd }: ProductPickerProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [quantity, setQuantity] = useState('1')
  const [error, setError] = useState<string | null>(null)

  const handleAdd = () => {
    if (!product) {
      setError('Selecciona un producto')
      return
    }
    const parsed = Number(quantity)
    if (!Number.isInteger(parsed) || parsed < 1) {
      setError('La cantidad debe ser un entero mayor a 0')
      return
    }
    onAdd(product.id, parsed)
    setProduct(null)
    setQuantity('1')
    setError(null)
  }

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
      <Autocomplete
        options={products}
        value={product}
        onChange={(_, value) => {
          setProduct(value)
          setError(null)
        }}
        getOptionLabel={(option) =>
          `${option.name} (${option.sku}) · ${formatCLP(option.price)} · stock ${option.stock}`
        }
        isOptionEqualToValue={(option, value) => option.id === value.id}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props
          return (
            <Box component="li" key={key} {...optionProps} sx={{ gap: 1.5 }}>
              <ProductImage
                src={option.imageUrl}
                alt={option.name}
                sx={{ width: 40, height: 40, borderRadius: 1, fontSize: 9 }}
              />
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="body2">
                  {option.name} ({option.sku})
                </Typography>
                <Typography
                  variant="caption"
                  color={option.stock === 0 ? 'warning.main' : 'text.secondary'}
                >
                  {formatCLP(option.price)} · stock {option.stock}
                </Typography>
              </Box>
            </Box>
          )
        }}
        noOptionsText="Sin productos"
        sx={{ flexGrow: 1, width: '100%' }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Producto"
            size="small"
            slotProps={{
              ...params.slotProps,
              input: {
                ...params.slotProps.input,
                startAdornment: product ? (
                  <InputAdornment position="start">
                    <ProductImage
                      src={product.imageUrl}
                      alt={product.name}
                      sx={{ width: 28, height: 28, borderRadius: 0.5, fontSize: 7 }}
                    />
                  </InputAdornment>
                ) : null,
              },
            }}
            error={error !== null && !product}
            helperText={!product ? error : null}
          />
        )}
      />
      <TextField
        label="Cantidad"
        type="number"
        size="small"
        value={quantity}
        onChange={(event) => setQuantity(event.target.value)}
        error={error !== null && !!product}
        helperText={product ? error : null}
        slotProps={{ htmlInput: { min: 1, step: 1 } }}
        sx={{ width: { xs: '100%', sm: 120 } }}
      />
      <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd} sx={{ flexShrink: 0 }}>
        Agregar
      </Button>
    </Stack>
  )
}

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined'
import UploadIcon from '@mui/icons-material/Upload'
import { Button, FormHelperText, Stack, TextField, Typography } from '@mui/material'
import { useRef, useState } from 'react'
import { ACCEPTED_IMAGE_TYPES, resizeImageFile } from '@/shared/utils/resizeImage'
import { isDataImageUrl } from '../utils/productImage'
import { ProductImage } from './ProductImage'

interface ProductImageFieldProps {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  error?: string
  productName: string
}

export function ProductImageField({
  value,
  onChange,
  onBlur,
  error,
  productName,
}: ProductImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [processing, setProcessing] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const uploaded = isDataImageUrl(value)

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    setUploadError(null)
    setProcessing(true)
    try {
      onChange(await resizeImageFile(file))
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'No se pudo procesar la imagen.')
    } finally {
      setProcessing(false)
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const message = uploadError ?? error

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
      <ProductImage
        src={value || undefined}
        alt={productName || 'Vista previa del producto'}
        sx={{ width: 160, height: 120, borderRadius: 1, border: 1, borderColor: 'divider' }}
      />
      <Stack spacing={1} sx={{ flexGrow: 1, width: '100%' }}>
        <Typography variant="subtitle2" component="p">
          Foto del producto (opcional)
        </Typography>
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<UploadIcon />}
            loading={processing}
            onClick={() => inputRef.current?.click()}
          >
            Subir foto
          </Button>
          {value && (
            <Button
              size="small"
              color="error"
              startIcon={<DeleteOutlineIcon />}
              onClick={() => {
                setUploadError(null)
                onChange('')
              }}
            >
              Quitar foto
            </Button>
          )}
        </Stack>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_IMAGE_TYPES.join(',')}
          hidden
          data-testid="product-image-input"
          onChange={(event) => void handleFile(event.target.files?.[0])}
        />
        <TextField
          label="…o pega la URL de una imagen"
          size="small"
          fullWidth
          value={uploaded ? '' : value}
          placeholder={uploaded ? 'Imagen subida desde tu computador' : 'https://…'}
          onChange={(event) => {
            setUploadError(null)
            onChange(event.target.value)
          }}
          onBlur={onBlur}
          error={!!message}
        />
        <FormHelperText error={!!message} sx={{ mt: 0 }}>
          {message ?? 'JPG, PNG o WebP de hasta 5 MB. Se reduce automáticamente.'}
        </FormHelperText>
      </Stack>
    </Stack>
  )
}

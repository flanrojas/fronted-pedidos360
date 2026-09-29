import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Alert, Button, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { Link, useNavigate, useParams } from 'react-router'
import { apiCapabilities } from '@/shared/api/apiMode'
import { QueryErrorAlert } from '@/shared/components/QueryErrorAlert'
import { isValidId, parseId } from '@/shared/utils/entityId'
import { useNotify } from '@/shared/notifications/useNotify'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import { ProductForm } from '../components/ProductForm'
import { useCreateProduct, useProduct, useProducts, useUpdateProduct } from '../hooks/useProducts'
import type { ProductFormValues } from '../schemas/productSchema'

export function ProductFormPage() {
  const { id } = useParams()
  const isEdit = id !== undefined
  const productId = isEdit ? parseId(id) : undefined
  const navigate = useNavigate()
  const notify = useNotify()
  const canEdit = apiCapabilities().catalog.edit

  const productsQuery = useProducts()
  const productQuery = useProduct(productId, { enabled: canEdit })
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const mutation = isEdit ? updateProduct : createProduct

  const handleSubmit = (values: ProductFormValues) => {
    if (productId !== undefined) {
      const { sku, name, description, price, imageUrl } = values
      updateProduct.mutate(
        { id: productId, changes: { sku, name, description, price, imageUrl } },
        {
          onSuccess: (product) => {
            notify.success(`Producto «${product.name}» actualizado.`)
            navigate('/catalog')
          },
          onError: (error) => notify.error('No se pudo guardar el producto.', error),
        },
      )
    } else {
      createProduct.mutate(
        { ...values, active: true },
        {
          onSuccess: (product) => {
            notify.success(`Producto «${product.name}» creado.`)
            navigate('/catalog')
          },
          onError: (error) => notify.error('No se pudo crear el producto.', error),
        },
      )
    }
  }

  const renderBody = () => {
    if (isEdit && !canEdit) {
      return <Alert severity="info">El backend todavía no permite editar productos.</Alert>
    }
    if (isEdit && !isValidId(productId)) {
      return <QueryErrorAlert message="El identificador del producto no es válido." />
    }
    const loading = productsQuery.isPending || (isEdit && productQuery.isPending)
    if (loading) {
      return (
        <Stack spacing={2} aria-label="Cargando formulario">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Stack>
      )
    }
    if (productsQuery.isError) {
      return (
        <QueryErrorAlert
          message={`No se pudo cargar el catálogo. ${getErrorMessage(productsQuery.error)}`}
          onRetry={() => void productsQuery.refetch()}
        />
      )
    }
    if (isEdit && productQuery.isError) {
      return (
        <QueryErrorAlert
          message={`No se pudo cargar el producto. ${getErrorMessage(productQuery.error)}`}
          onRetry={() => void productQuery.refetch()}
        />
      )
    }
    return (
      <ProductForm
        product={isEdit ? productQuery.data : undefined}
        existingProducts={productsQuery.data}
        submitting={mutation.isPending}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <>
      <Button component={Link} to="/catalog" startIcon={<ArrowBackIcon />} sx={{ mb: 1 }}>
        Volver al catálogo
      </Button>
      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 720 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          {isEdit ? 'Editar producto' : 'Nuevo producto'}
        </Typography>
        {renderBody()}
      </Paper>
    </>
  )
}

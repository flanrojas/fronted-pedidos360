import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Button, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/useAuth'
import { useProducts } from '@/features/catalog/hooks/useProducts'
import { useCustomers } from '@/features/users/hooks/useUsers'
import { QueryErrorAlert } from '@/shared/components/QueryErrorAlert'
import { useNotify } from '@/shared/notifications/useNotify'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import { OrderForm } from '../components/OrderForm'
import { useCreateOrder } from '../hooks/useOrders'
import type { OrderFormValues } from '../schemas/orderFormSchema'
import { buildNewOrder } from '../utils/buildNewOrder'

export function OrderFormPage() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const notify = useNotify()
  const isCustomer = currentUser?.role === 'CUSTOMER'

  const productsQuery = useProducts()
  const customersQuery = useCustomers({ enabled: !isCustomer })
  const createOrder = useCreateOrder()

  if (!currentUser) return null

  const handleSubmit = (values: OrderFormValues) => {
    const customer = isCustomer
      ? currentUser
      : customersQuery.data?.find((c) => c.id === values.customerId)
    if (!customer || !productsQuery.data) return

    const order = buildNewOrder({
      customer,
      lines: values.items,
      products: productsQuery.data,
      createdBy: currentUser,
    })
    createOrder.mutate(order, {
      onSuccess: (created) => {
        notify.success(`Pedido N° ${created.id} creado para ${created.customerName}.`)
        navigate('/orders')
      },
      onError: (error) => notify.error('No se pudo crear el pedido.', error),
    })
  }

  const renderBody = () => {
    if (productsQuery.isPending || (!isCustomer && customersQuery.isPending)) {
      return (
        <Stack spacing={2} aria-label="Cargando formulario">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={56} />
          ))}
        </Stack>
      )
    }
    if (productsQuery.isError) {
      return (
        <QueryErrorAlert
          message={`No se pudieron cargar los productos. ${getErrorMessage(productsQuery.error)}`}
          onRetry={() => void productsQuery.refetch()}
        />
      )
    }
    if (!isCustomer && customersQuery.isError) {
      return (
        <QueryErrorAlert
          message={`No se pudieron cargar los clientes. ${getErrorMessage(customersQuery.error)}`}
          onRetry={() => void customersQuery.refetch()}
        />
      )
    }
    return (
      <OrderForm
        products={productsQuery.data}
        customers={isCustomer ? undefined : customersQuery.data}
        fixedCustomer={isCustomer ? currentUser : undefined}
        submitting={createOrder.isPending}
        onSubmit={handleSubmit}
      />
    )
  }

  return (
    <>
      <Button component={Link} to="/orders" startIcon={<ArrowBackIcon />} sx={{ mb: 1 }}>
        Volver a pedidos
      </Button>
      <Paper sx={{ p: { xs: 2, md: 3 }, maxWidth: 960 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Nuevo pedido
        </Typography>
        {renderBody()}
      </Paper>
    </>
  )
}

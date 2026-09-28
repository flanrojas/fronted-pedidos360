import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { Box, Button, Paper, Skeleton, Stack, Typography } from '@mui/material'
import { isAxiosError } from 'axios'
import { useMemo, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router'
import { can } from '@/auth/permissions'
import { useAuth } from '@/auth/useAuth'
import { useProducts } from '@/features/catalog/hooks/useProducts'
import { QueryErrorAlert } from '@/shared/components/QueryErrorAlert'
import { useNotify } from '@/shared/notifications/useNotify'
import { formatDateTime } from '@/shared/utils/formatDate'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import { CancelOrderDialog } from '../components/CancelOrderDialog'
import { OrderHistoryTimeline } from '../components/OrderHistoryTimeline'
import { OrderItemsTable } from '../components/OrderItemsTable'
import { OrderStatusActions } from '../components/OrderStatusActions'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { InsufficientStockError } from '../errors'
import { useChangeOrderStatus, useOrder } from '../hooks/useOrders'
import { STATUS_LABELS, type OrderStatus } from '../types'

export function OrderDetailPage() {
  const { id } = useParams()
  const orderId = Number(id)
  const { currentUser } = useAuth()
  const { data: order, isPending, isError, error, refetch } = useOrder(orderId)
  const changeStatus = useChangeOrderStatus()
  // Items only snapshot name and price, so photos come from the current catalog.
  // If products fail to load the detail still works, showing placeholders.
  const { data: products } = useProducts()
  const imagesByProductId = useMemo(
    () => new Map((products ?? []).map((product) => [product.id, product.imageUrl])),
    [products],
  )
  const [confirmCancel, setConfirmCancel] = useState(false)
  const notify = useNotify()

  if (!currentUser) return null

  const header = (
    <Button
      component={Link}
      to="/orders"
      startIcon={<ArrowBackIcon color="secondary" />}
      sx={{ mb: 1 }}
    >
      Volver a pedidos
    </Button>
  )

  if (!Number.isInteger(orderId)) {
    return (
      <>
        {header}
        <QueryErrorAlert message="El identificador del pedido no es válido." />
      </>
    )
  }

  if (isPending) {
    return (
      <>
        {header}
        <Stack spacing={2} aria-label="Cargando pedido">
          <Skeleton variant="rounded" height={96} />
          <Skeleton variant="rounded" height={200} />
        </Stack>
      </>
    )
  }

  if (isError) {
    const notFound = isAxiosError(error) && error.response?.status === 404
    return (
      <>
        {header}
        <QueryErrorAlert
          message={
            notFound
              ? `El pedido N° ${orderId} no existe.`
              : `No se pudo cargar el pedido. ${getErrorMessage(error)}`
          }
          onRetry={notFound ? undefined : () => void refetch()}
        />
      </>
    )
  }

  // A CUSTOMER may only see their own orders.
  // TODO(fase2): el backend debe impedir esta lectura; aquí solo se oculta en la UI.
  if (!can(currentUser.role, 'orders:viewAll') && order.customerId !== currentUser.id) {
    return <Navigate to="/403" replace />
  }

  const canChangeStatus = can(currentUser.role, 'orders:changeStatus')

  const applyTransition = (to: OrderStatus) => {
    changeStatus.mutate(
      { order, to, user: currentUser },
      {
        onSuccess: (updated) => {
          setConfirmCancel(false)
          notify.success(
            `Pedido N° ${updated.id} actualizado a «${STATUS_LABELS[updated.status]}».`,
          )
        },
        onError: (mutationError) => {
          setConfirmCancel(false)
          if (mutationError instanceof InsufficientStockError) {
            notify.notify({
              severity: 'error',
              message: 'No hay stock suficiente. El pedido sigue en «Creado».',
              details: mutationError.shortages.map(
                (s) => `${s.productName}: pedido ${s.requested}, disponible ${s.available}`,
              ),
            })
          } else {
            notify.error('No se pudo cambiar el estado.', mutationError)
          }
        },
      },
    )
  }

  const handleAction = (to: OrderStatus) => {
    if (to === 'CANCELLED') {
      setConfirmCancel(true)
    } else {
      applyTransition(to)
    }
  }

  return (
    <>
      {header}
      <Stack spacing={2}>
        <Paper sx={{ p: { xs: 2, md: 3 } }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            // flex-start: keep action buttons at their natural height instead of stretching.
            sx={{ justifyContent: 'space-between', alignItems: { sm: 'flex-start' }, gap: 2 }}
          >
            <Box>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', mb: 1, gap: 1.5, flexWrap: 'wrap' }}
              >
                <Typography variant="h5" component="h1">
                  Pedido N° {order.id}
                </Typography>
                <OrderStatusBadge status={order.status} size="medium" />
              </Stack>
              <Typography>
                Cliente: <strong>{order.customerName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Creado el {formatDateTime(order.createdAt)} · Última actualización{' '}
                {formatDateTime(order.updatedAt)}
              </Typography>
            </Box>
            {canChangeStatus && (
              <OrderStatusActions
                status={order.status}
                pendingStatus={changeStatus.isPending ? changeStatus.variables.to : undefined}
                onAction={handleAction}
              />
            )}
          </Stack>
        </Paper>

        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={2}
          sx={{ alignItems: 'flex-start' }}
        >
          <Box sx={{ flex: 2, width: '100%', minWidth: 0 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Ítems
            </Typography>
            <OrderItemsTable
              items={order.items}
              total={order.total}
              imagesByProductId={imagesByProductId}
            />
          </Box>
          <Paper variant="outlined" sx={{ flex: 1, width: '100%', p: 2 }}>
            <Typography variant="h6" component="h2">
              Historial
            </Typography>
            <OrderHistoryTimeline history={order.history} />
          </Paper>
        </Stack>
      </Stack>

      <CancelOrderDialog
        order={order}
        open={confirmCancel}
        submitting={changeStatus.isPending}
        onConfirm={() => applyTransition('CANCELLED')}
        onClose={() => setConfirmCancel(false)}
      />
    </>
  )
}

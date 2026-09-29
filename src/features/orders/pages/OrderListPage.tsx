import AddIcon from '@mui/icons-material/Add'
import { Button, Skeleton, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { can } from '@/auth/permissions'
import { useAuth } from '@/auth/useAuth'
import { EmptyState } from '@/shared/components/EmptyState'
import { QueryErrorAlert } from '@/shared/components/QueryErrorAlert'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import { OrderFiltersBar } from '../components/OrderFiltersBar'
import { OrdersTable } from '../components/OrdersTable'
import { useOrders } from '../hooks/useOrders'
import type { OrderListParams } from '../types'
import { EMPTY_ORDER_FILTERS, filterOrders, type OrderFilters } from '../utils/filterOrders'

export function OrderListPage() {
  const { currentUser } = useAuth()
  const role = currentUser?.role ?? 'CUSTOMER'
  const viewAll = can(role, 'orders:viewAll')
  const canCreate = can(role, 'orders:create')

  const params = useMemo<OrderListParams>(
    () => (viewAll ? {} : { customerId: currentUser?.id }),
    [viewAll, currentUser?.id],
  )
  const {
    data: orders,
    isPending,
    isError,
    error,
    refetch,
  } = useOrders(params, {
    enabled: currentUser !== null,
  })
  const customers = useMemo(() => Array.from(
    new Map((orders ?? []).map((order) => [order.customerId, {
      id: order.customerId,
      name: order.customerName,
    }])).values(),
  ), [orders])

  const [filters, setFilters] = useState<OrderFilters>(EMPTY_ORDER_FILTERS)
  const visibleOrders = useMemo(() => filterOrders(orders ?? [], filters), [orders, filters])

  const renderContent = () => {
    if (isPending) {
      return (
        <Stack spacing={1} aria-label="Cargando pedidos">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} variant="rounded" height={44} />
          ))}
        </Stack>
      )
    }
    if (isError) {
      return (
        <QueryErrorAlert
          message={`No se pudieron cargar los pedidos. ${getErrorMessage(error)}`}
          onRetry={() => void refetch()}
        />
      )
    }
    if (orders.length === 0) {
      return (
        <EmptyState
          title="Aún no hay pedidos"
          action={
            canCreate && (
              <Button variant="contained" component={Link} to="/orders/new">
                Crear el primero
              </Button>
            )
          }
        />
      )
    }
    if (visibleOrders.length === 0) {
      return (
        <EmptyState
          title="No hay pedidos que coincidan"
          description="Prueba cambiando o limpiando los filtros."
        />
      )
    }
    return <OrdersTable orders={visibleOrders} />
  }

  return (
    <>
      <Stack
        direction="row"
        sx={{
          mb: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h5" component="h1">
          {viewAll ? 'Pedidos' : 'Mis pedidos'}
        </Typography>
        {canCreate && (
          <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/orders/new">
            Nuevo pedido
          </Button>
        )}
      </Stack>

      <OrderFiltersBar
        filters={filters}
        onChange={setFilters}
        customers={viewAll ? customers : undefined}
      />
      {renderContent()}
    </>
  )
}

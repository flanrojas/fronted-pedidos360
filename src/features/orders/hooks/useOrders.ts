import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { User } from '@/auth/types'
import { isValidId, type EntityId } from '@/shared/utils/entityId'
import { PRODUCTS_KEY } from '@/features/catalog/hooks/useProducts'
import { ordersService } from '../services/ordersService'
import type { NewOrder, Order, OrderListParams, OrderStatus } from '../types'

export const ORDERS_KEY = ['orders'] as const

export function useOrders(params: OrderListParams, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...ORDERS_KEY, 'list', params],
    queryFn: () => ordersService.list(params),
    enabled,
  })
}

export function useOrder(id: EntityId | undefined) {
  return useQuery({
    queryKey: [...ORDERS_KEY, 'detail', id],
    queryFn: () => ordersService.getById(id as EntityId),
    enabled: isValidId(id),
  })
}

interface ChangeStatusInput {
  order: Order
  to: OrderStatus
  user: Pick<User, 'name' | 'role'>
}

export function useChangeOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ order, to, user }: ChangeStatusInput) =>
      ordersService.changeStatus(order, to, user),
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: ORDERS_KEY }),
        queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY }),
      ]),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (order: NewOrder) => ordersService.create(order),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ORDERS_KEY }),
  })
}

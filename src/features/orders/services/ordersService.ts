import { can } from '@/auth/permissions'
import type { User } from '@/auth/types'
import { apiClient } from '@/shared/api/apiClient'
import type { EntityId } from '@/shared/utils/entityId'
import { InvalidTransitionError, StaleOrderError, StatusChangeForbiddenError } from '../errors'
import type { NewOrder, Order, OrderListParams, OrderStatus } from '../types'
import { canTransition } from '../utils/orderStateMachine'
import { STATUS_TO_BACKEND, toBackendNewOrder, toOrder, type BackendOrder } from './ordersBackend'

export const ordersService = {
  async list(params: OrderListParams = {}): Promise<Order[]> {
    const { data } = await apiClient.get<BackendOrder[]>('/api/orders', {
      params: params.customerId === undefined ? undefined : { cliente_id: String(params.customerId) },
    })
    return data.map(toOrder).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  },

  async getById(id: EntityId): Promise<Order> {
    const { data } = await apiClient.get<BackendOrder>(`/api/orders/${id}`)
    return toOrder(data)
  },

  async create(order: NewOrder): Promise<Order> {
    const { data } = await apiClient.post<BackendOrder>('/api/orders', toBackendNewOrder(order))
    return toOrder(data)
  },

  async changeStatus(order: Order, to: OrderStatus, user: Pick<User, 'name' | 'role'>): Promise<Order> {
    if (!can(user.role, 'orders:changeStatus')) throw new StatusChangeForbiddenError()
    if (!canTransition(order.status, to)) throw new InvalidTransitionError(order.status, to)

    const current = await ordersService.getById(order.id)
    if (current.status !== order.status) throw new StaleOrderError()

    const { data } = await apiClient.patch<BackendOrder>(`/api/orders/${order.id}/estado`, {
      estado: STATUS_TO_BACKEND[to],
    })
    return toOrder(data)
  },
}

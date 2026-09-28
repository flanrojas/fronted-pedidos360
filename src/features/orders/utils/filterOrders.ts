import type { Order, OrderStatus } from '../types'

export interface OrderFilters {
  status: OrderStatus | 'all'
  /** Local date `yyyy-mm-dd`, inclusive. Empty = no lower bound. */
  from: string
  /** Local date `yyyy-mm-dd`, inclusive. Empty = no upper bound. */
  to: string
  customerId: number | 'all'
}

export const EMPTY_ORDER_FILTERS: OrderFilters = {
  status: 'all',
  from: '',
  to: '',
  customerId: 'all',
}

/** Filters by status, local-date range and customer, then sorts newest first. */
export function filterOrders(orders: readonly Order[], filters: OrderFilters): Order[] {
  const fromTime = filters.from ? new Date(`${filters.from}T00:00:00`).getTime() : -Infinity
  const toTime = filters.to ? new Date(`${filters.to}T23:59:59.999`).getTime() : Infinity

  return orders
    .filter((order) => {
      if (filters.status !== 'all' && order.status !== filters.status) return false
      if (filters.customerId !== 'all' && order.customerId !== filters.customerId) return false
      const created = new Date(order.createdAt).getTime()
      return created >= fromTime && created <= toTime
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

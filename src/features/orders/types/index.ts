import type { EntityId } from '@/shared/utils/entityId'

export type OrderStatus =
  'CREATED' | 'ACCEPTED' | 'PREPARING' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'

export const ORDER_STATUSES: readonly OrderStatus[] = [
  'CREATED',
  'ACCEPTED',
  'PREPARING',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
]

export const STATUS_LABELS: Record<OrderStatus, string> = {
  CREATED: 'Creado',
  ACCEPTED: 'Aceptado',
  PREPARING: 'En preparación',
  DISPATCHED: 'Despachado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}

export interface OrderItem {
  productId: EntityId
  productName: string
  quantity: number
  unitPrice: number
  priceKnown?: boolean
}

export interface StatusHistoryEntry {
  status: OrderStatus
  at: string
  by: string
}

export interface Order {
  id: EntityId
  customerId: EntityId
  customerName: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  createdAt: string
  updatedAt: string
  history: StatusHistoryEntry[]
}

export type NewOrder = Omit<Order, 'id'>

export interface OrderListParams {
  customerId?: EntityId
}

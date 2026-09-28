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
  productId: number
  /** Snapshot of the product name when the order was created. */
  productName: string
  quantity: number
  /** Snapshot of the product price (CLP) when the order was created. */
  unitPrice: number
}

export interface StatusHistoryEntry {
  status: OrderStatus
  /** ISO 8601 */
  at: string
  /** Name of the user who made the change. */
  by: string
}

export interface Order {
  id: number
  customerId: number
  customerName: string
  items: OrderItem[]
  total: number
  status: OrderStatus
  /** ISO 8601 */
  createdAt: string
  /** ISO 8601 */
  updatedAt: string
  history: StatusHistoryEntry[]
}

export type NewOrder = Omit<Order, 'id'>

export interface OrderListParams {
  /** Only this customer's orders (always set for CUSTOMER). */
  customerId?: number
}

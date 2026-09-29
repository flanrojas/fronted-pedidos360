import { toNumber } from '@/features/catalog/services/catalogBackend'
import { parseId } from '@/shared/utils/entityId'
import type { NewOrder, Order, OrderItem, OrderStatus } from '../types'
import { calculateTotal } from '../utils/orderTotals'

export type BackendStatus =
  'CREADO' | 'ACEPTADO' | 'EN_PREPARACION' | 'DESPACHADO' | 'ENTREGADO' | 'CANCELADO'

export const STATUS_TO_BACKEND: Record<OrderStatus, BackendStatus> = {
  CREATED: 'CREADO',
  ACCEPTED: 'ACEPTADO',
  PREPARING: 'EN_PREPARACION',
  DISPATCHED: 'DESPACHADO',
  DELIVERED: 'ENTREGADO',
  CANCELLED: 'CANCELADO',
}

export const STATUS_FROM_BACKEND = Object.fromEntries(
  Object.entries(STATUS_TO_BACKEND).map(([front, back]) => [back, front]),
) as Record<BackendStatus, OrderStatus>

export interface BackendOrderItem {
  producto_id: string
  nombre?: string
  cantidad: number | string
  precio_unitario?: number | string
}

export interface BackendOrder {
  id: string
  cliente_id: string
  items: BackendOrderItem[]
  estado: BackendStatus
  fecha_creacion: string
}

export interface BackendNewOrder {
  cliente_id: string
  items: BackendOrderItem[]
}

export function backendDateToIso(value: string): string {
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value)
  const date = new Date(hasZone ? value : `${value}Z`)
  return Number.isNaN(date.getTime()) ? value : date.toISOString()
}

export function toOrder(order: BackendOrder): Order {
  const items: OrderItem[] = order.items.map((item) => ({
    productId: parseId(item.producto_id),
    productName: item.nombre ?? String(item.producto_id),
    quantity: toNumber(item.cantidad),
    unitPrice: toNumber(item.precio_unitario),
    ...(item.precio_unitario === undefined ? { priceKnown: false } : {}),
  }))
  const createdAt = backendDateToIso(order.fecha_creacion)
  return {
    id: parseId(order.id),
    customerId: parseId(order.cliente_id),
    customerName: order.cliente_id,
    items,
    total: calculateTotal(items),
    status: STATUS_FROM_BACKEND[order.estado] ?? 'CREATED',
    createdAt,
    updatedAt: createdAt,
    history: [],
  }
}

export function toBackendNewOrder(order: NewOrder): BackendNewOrder {
  return {
    cliente_id: String(order.customerId),
    items: order.items.map((item) => ({
      producto_id: String(item.productId),
      nombre: item.productName,
      cantidad: item.quantity,
      precio_unitario: item.unitPrice,
    })),
  }
}

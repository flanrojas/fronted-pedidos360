import type { Order, OrderStatus } from '@/features/orders/types'
import type { EntityId } from '@/shared/utils/entityId'

export function makeOrder(
  id: EntityId,
  customer: { id: EntityId; name: string },
  status: OrderStatus,
  [year, month, day, hour = 12]: [number, number, number, number?],
): Order {
  const createdAt = new Date(year, month - 1, day, hour).toISOString()
  return {
    id,
    customerId: customer.id,
    customerName: customer.name,
    items: [{ productId: 1, productName: 'Café en grano 1 kg', quantity: 2, unitPrice: 15990 }],
    total: 31980,
    status,
    createdAt,
    updatedAt: createdAt,
    history: [{ status: 'CREATED', at: createdAt, by: customer.name }],
  }
}

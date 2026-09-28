import type { Product } from '@/features/catalog/types'
import type { User } from '@/auth/types'
import type { NewOrder, OrderItem } from '../types'
import { calculateTotal } from './orderTotals'

export interface OrderLineInput {
  productId: number
  quantity: number
}

interface BuildNewOrderInput {
  customer: Pick<User, 'id' | 'name'>
  lines: readonly OrderLineInput[]
  products: readonly Product[]
  createdBy: Pick<User, 'name'>
  now?: Date
}

/**
 * Builds a new order in CREATED status, snapshotting product name and price.
 * Stock is NOT deducted here: that happens when the order is ACCEPTED.
 */
export function buildNewOrder({
  customer,
  lines,
  products,
  createdBy,
  now = new Date(),
}: BuildNewOrderInput): NewOrder {
  const items: OrderItem[] = lines.map(({ productId, quantity }) => {
    const product = products.find((p) => p.id === productId)
    if (!product) throw new Error(`Producto ${productId} no encontrado`)
    return { productId, productName: product.name, quantity, unitPrice: product.price }
  })
  const timestamp = now.toISOString()

  return {
    customerId: customer.id,
    customerName: customer.name,
    items,
    total: calculateTotal(items),
    status: 'CREATED',
    createdAt: timestamp,
    updatedAt: timestamp,
    history: [{ status: 'CREATED', at: timestamp, by: createdBy.name }],
  }
}

import type { OrderItem } from '../types'

type PricedLine = Pick<OrderItem, 'quantity' | 'unitPrice'>

export function calculateSubtotal({ quantity, unitPrice }: PricedLine): number {
  return quantity * unitPrice
}

export function calculateTotal(items: readonly PricedLine[]): number {
  return items.reduce((total, item) => total + calculateSubtotal(item), 0)
}

export function countUnits(items: readonly Pick<OrderItem, 'quantity'>[]): number {
  return items.reduce((units, item) => units + item.quantity, 0)
}

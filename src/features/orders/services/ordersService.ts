import { can } from '@/auth/permissions'
import type { User } from '@/auth/types'
import { catalogService } from '@/features/catalog/services/catalogService'
import type { Product } from '@/features/catalog/types'
import { apiClient } from '@/shared/api/apiClient'
import {
  InsufficientStockError,
  InvalidTransitionError,
  StaleOrderError,
  StatusChangeForbiddenError,
  type StockShortage,
} from '../errors'
import type { NewOrder, Order, OrderItem, OrderListParams, OrderStatus } from '../types'
import { canTransition } from '../utils/orderStateMachine'

interface StockChange {
  product: Product
  delta: number
}

/** Sums quantities per product (defensive: the same product could appear on several lines). */
function quantitiesByProduct(items: readonly OrderItem[]): Map<number, number> {
  const totals = new Map<number, number>()
  for (const item of items) {
    totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.quantity)
  }
  return totals
}

async function fetchProducts(ids: Iterable<number>): Promise<Product[]> {
  return Promise.all([...ids].map((id) => catalogService.getById(id)))
}

/**
 * Applies stock deltas one product at a time. If one fails, the ones already applied
 * are reverted (best effort) and the error is rethrown. Returns an undo function.
 */
async function applyStockChanges(changes: readonly StockChange[]): Promise<() => Promise<void>> {
  const applied: StockChange[] = []
  const undo = async () => {
    for (const { product } of applied.reverse()) {
      await catalogService.updateStock(product.id, product.stock).catch(() => undefined)
    }
  }
  try {
    for (const change of changes) {
      await catalogService.updateStock(change.product.id, change.product.stock + change.delta)
      applied.push(change)
    }
  } catch (error) {
    await undo()
    throw error
  }
  return undo
}

/** Validates stock for every item against current values; throws listing all shortages. */
async function reserveStock(items: readonly OrderItem[]): Promise<() => Promise<void>> {
  const quantities = quantitiesByProduct(items)
  const products = await fetchProducts(quantities.keys())

  const shortages: StockShortage[] = products
    .filter((product) => product.stock < (quantities.get(product.id) ?? 0))
    .map((product) => ({
      productId: product.id,
      productName: product.name,
      requested: quantities.get(product.id) ?? 0,
      available: product.stock,
    }))
  if (shortages.length > 0) throw new InsufficientStockError(shortages)

  return applyStockChanges(
    products.map((product) => ({ product, delta: -(quantities.get(product.id) ?? 0) })),
  )
}

async function releaseStock(items: readonly OrderItem[]): Promise<() => Promise<void>> {
  const quantities = quantitiesByProduct(items)
  const products = await fetchProducts(quantities.keys())
  return applyStockChanges(
    products.map((product) => ({ product, delta: quantities.get(product.id) ?? 0 })),
  )
}

export const ordersService = {
  /** Newest first. Pass `customerId` to restrict to one customer (CUSTOMER role). */
  async list(params: OrderListParams = {}): Promise<Order[]> {
    const { data } = await apiClient.get<Order[]>('/orders', {
      params: { ...params, _sort: 'createdAt', _order: 'desc' },
    })
    return data
  },

  async getById(id: number): Promise<Order> {
    const { data } = await apiClient.get<Order>(`/orders/${id}`)
    return data
  },

  /** Creating an order never touches stock; stock is validated and deducted on ACCEPTED. */
  async create(order: NewOrder): Promise<Order> {
    const { data } = await apiClient.post<Order>('/orders', order)
    return data
  },

  /**
   * Moves an order to `to`, applying the stock rules:
   * - ACCEPTED: validates stock for all items (nothing changes if any is short) and deducts it.
   * - CANCELLED from ACCEPTED: returns the stock.
   * Always updates `status`, `updatedAt` and appends a `history` entry.
   */
  async changeStatus(
    order: Order,
    to: OrderStatus,
    user: Pick<User, 'name' | 'role'>,
    now: Date = new Date(),
  ): Promise<Order> {
    // TODO(fase2): esta coordinación la hará ms-pedidos360-orders en una sola llamada
    if (!can(user.role, 'orders:changeStatus')) throw new StatusChangeForbiddenError()
    if (!canTransition(order.status, to)) throw new InvalidTransitionError(order.status, to)

    // Re-read the order: another user may have changed it since it was loaded.
    const current = await ordersService.getById(order.id)
    if (current.status !== order.status) throw new StaleOrderError()

    let undoStock: (() => Promise<void>) | undefined
    if (to === 'ACCEPTED') {
      undoStock = await reserveStock(current.items)
    } else if (to === 'CANCELLED' && current.status === 'ACCEPTED') {
      undoStock = await releaseStock(current.items)
    }

    const at = now.toISOString()
    try {
      const { data } = await apiClient.patch<Order>(`/orders/${order.id}`, {
        status: to,
        updatedAt: at,
        history: [...current.history, { status: to, at, by: user.name }],
      })
      return data
    } catch (error) {
      await undoStock?.()
      throw error
    }
  },
}

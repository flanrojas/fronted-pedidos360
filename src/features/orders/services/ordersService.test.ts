import type { Product } from '@/features/catalog/types'
import { apiClient } from '@/shared/api/apiClient'
import { installFakeApi, type FakeDb } from '@/test/fakeApi'
import { customerUser, operatorUser } from '@/test/testUsers'
import {
  InsufficientStockError,
  InvalidTransitionError,
  StaleOrderError,
  StatusChangeForbiddenError,
} from '../errors'
import type { Order, OrderStatus } from '../types'
import { ordersService } from './ordersService'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

const NOW = new Date('2026-09-26T18:00:00.000Z')

const product = (id: number, name: string, stock: number): Product => ({
  id,
  sku: `SKU-${id}`,
  name,
  description: '',
  price: 1000,
  stock,
  active: true,
})

function makeOrder(status: OrderStatus): Order {
  return {
    id: 10,
    customerId: 3,
    customerName: 'Valentina Rojas',
    items: [
      { productId: 1, productName: 'Café', quantity: 2, unitPrice: 1000 },
      { productId: 2, productName: 'Té', quantity: 5, unitPrice: 1000 },
    ],
    total: 7000,
    status,
    createdAt: '2026-09-25T12:00:00.000Z',
    updatedAt: '2026-09-25T12:00:00.000Z',
    history: [{ status: 'CREATED', at: '2026-09-25T12:00:00.000Z', by: 'Valentina Rojas' }],
  }
}

function setup(status: OrderStatus, stocks: [number, number] = [40, 5]) {
  const order = makeOrder(status)
  const initial: FakeDb = {
    products: [product(1, 'Café', stocks[0]), product(2, 'Té', stocks[1])],
    orders: [order],
  }
  const db = installFakeApi(initial)
  const stockOf = (id: number) => db.products.find((p) => p.id === id)?.stock
  return { order, db, initial, stockOf }
}

describe('ordersService.changeStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('accepting with enough stock deducts it and records the change', async () => {
    const { order, db, stockOf } = setup('CREATED', [40, 5])

    const updated = await ordersService.changeStatus(order, 'ACCEPTED', operatorUser, NOW)

    expect(stockOf(1)).toBe(38)
    expect(stockOf(2)).toBe(0)
    expect(updated.status).toBe('ACCEPTED')
    expect(updated.updatedAt).toBe(NOW.toISOString())
    expect(updated.history).toEqual([
      ...order.history,
      { status: 'ACCEPTED', at: NOW.toISOString(), by: 'Carlos Muñoz' },
    ])
    expect(db.orders[0]).toEqual(updated)
  })

  it('accepting without enough stock changes nothing and lists the short products', async () => {
    const { order, db, initial } = setup('CREATED', [1, 3])

    const error = await ordersService
      .changeStatus(order, 'ACCEPTED', operatorUser, NOW)
      .catch((e: unknown) => e)

    expect(error).toBeInstanceOf(InsufficientStockError)
    expect((error as InsufficientStockError).shortages).toEqual([
      { productId: 1, productName: 'Café', requested: 2, available: 1 },
      { productId: 2, productName: 'Té', requested: 5, available: 3 },
    ])
    expect(apiClient.patch).not.toHaveBeenCalled()
    expect(db).toEqual(initial)
  })

  it('cancelling an ACCEPTED order returns the stock', async () => {
    const { order, stockOf } = setup('ACCEPTED', [38, 0])

    const updated = await ordersService.changeStatus(order, 'CANCELLED', operatorUser, NOW)

    expect(stockOf(1)).toBe(40)
    expect(stockOf(2)).toBe(5)
    expect(updated.status).toBe('CANCELLED')
    expect(updated.history.at(-1)).toEqual({
      status: 'CANCELLED',
      at: NOW.toISOString(),
      by: 'Carlos Muñoz',
    })
  })

  it('cancelling a CREATED order does not touch stock', async () => {
    const { order, stockOf } = setup('CREATED', [40, 5])

    await ordersService.changeStatus(order, 'CANCELLED', operatorUser, NOW)

    expect(stockOf(1)).toBe(40)
    expect(stockOf(2)).toBe(5)
  })

  it.each<[OrderStatus, OrderStatus]>([
    ['ACCEPTED', 'PREPARING'],
    ['PREPARING', 'DISPATCHED'],
    ['DISPATCHED', 'DELIVERED'],
  ])('%s → %s does not touch stock', async (from, to) => {
    const { order, stockOf } = setup(from, [40, 5])

    const updated = await ordersService.changeStatus(order, to, operatorUser, NOW)

    expect(updated.status).toBe(to)
    expect(stockOf(1)).toBe(40)
    expect(stockOf(2)).toBe(5)
  })

  it('rejects an invalid transition (CREATED → DISPATCHED) without any request', async () => {
    const { order } = setup('CREATED')

    await expect(
      ordersService.changeStatus(order, 'DISPATCHED', operatorUser, NOW),
    ).rejects.toBeInstanceOf(InvalidTransitionError)
    expect(apiClient.get).not.toHaveBeenCalled()
    expect(apiClient.patch).not.toHaveBeenCalled()
  })

  it('rejects a CUSTOMER changing status', async () => {
    const { order } = setup('CREATED')

    await expect(
      ordersService.changeStatus(order, 'ACCEPTED', customerUser, NOW),
    ).rejects.toBeInstanceOf(StatusChangeForbiddenError)
    expect(apiClient.patch).not.toHaveBeenCalled()
  })

  it('rejects when the order changed on the server meanwhile', async () => {
    const { order, db } = setup('CREATED')
    db.orders[0].status = 'CANCELLED'

    await expect(
      ordersService.changeStatus(order, 'ACCEPTED', operatorUser, NOW),
    ).rejects.toBeInstanceOf(StaleOrderError)
    expect(apiClient.patch).not.toHaveBeenCalled()
  })

  it('restores stock if saving the order fails after deducting it', async () => {
    const { order, stockOf } = setup('CREATED', [40, 5])
    const patch = vi.mocked(apiClient.patch).getMockImplementation()!
    vi.mocked(apiClient.patch).mockImplementation(((url: string, body: object) =>
      url.startsWith('/orders')
        ? Promise.reject(new Error('network down'))
        : patch(url, body)) as typeof apiClient.patch)

    await expect(ordersService.changeStatus(order, 'ACCEPTED', operatorUser, NOW)).rejects.toThrow(
      'network down',
    )
    expect(stockOf(1)).toBe(40)
    expect(stockOf(2)).toBe(5)
  })
})

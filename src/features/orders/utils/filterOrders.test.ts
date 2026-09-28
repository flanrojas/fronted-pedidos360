import { makeOrder } from '@/test/fixtures/orders'
import { customerUser, otherCustomerUser } from '@/test/testUsers'
import { EMPTY_ORDER_FILTERS, filterOrders } from './filterOrders'

const orders = [
  makeOrder(1, customerUser, 'DELIVERED', [2026, 9, 1]),
  makeOrder(2, otherCustomerUser, 'CREATED', [2026, 9, 10, 0]),
  makeOrder(3, customerUser, 'CREATED', [2026, 9, 10, 23]),
  makeOrder(4, otherCustomerUser, 'CANCELLED', [2026, 9, 20]),
]

const ids = (list: { id: number }[]) => list.map((o) => o.id)

describe('filterOrders', () => {
  it('sorts newest first with no filters', () => {
    expect(ids(filterOrders(orders, EMPTY_ORDER_FILTERS))).toEqual([4, 3, 2, 1])
  })

  it('filters by status', () => {
    expect(ids(filterOrders(orders, { ...EMPTY_ORDER_FILTERS, status: 'CREATED' }))).toEqual([3, 2])
  })

  it('filters by customer', () => {
    expect(ids(filterOrders(orders, { ...EMPTY_ORDER_FILTERS, customerId: 4 }))).toEqual([4, 2])
  })

  it('includes whole days at both ends of the date range', () => {
    const sameDay = { ...EMPTY_ORDER_FILTERS, from: '2026-09-10', to: '2026-09-10' }
    expect(ids(filterOrders(orders, sameDay))).toEqual([3, 2])
  })

  it('supports open-ended ranges', () => {
    expect(ids(filterOrders(orders, { ...EMPTY_ORDER_FILTERS, from: '2026-09-11' }))).toEqual([4])
    expect(ids(filterOrders(orders, { ...EMPTY_ORDER_FILTERS, to: '2026-09-09' }))).toEqual([1])
  })

  it('combines filters', () => {
    const filters = { status: 'CREATED' as const, from: '2026-09-01', to: '', customerId: 3 }
    expect(ids(filterOrders(orders, filters))).toEqual([3])
  })
})

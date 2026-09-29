import { ORDER_STATUSES } from '../types'
import {
  backendDateToIso,
  STATUS_FROM_BACKEND,
  STATUS_TO_BACKEND,
  toBackendNewOrder,
  toOrder,
  type BackendOrder,
} from './ordersBackend'

const backendOrder: BackendOrder = {
  id: '5b70b6e1-1522-478c-9f7b-956c70a523df',
  cliente_id: '3',
  items: [
    { producto_id: '1', nombre: 'Café en grano 1 kg', cantidad: '2', precio_unitario: '15990' },
    { producto_id: 'uuid-te', nombre: 'Té verde', cantidad: 1, precio_unitario: 4990 },
  ],
  estado: 'EN_PREPARACION',
  fecha_creacion: '2026-09-27T01:24:22.576232',
}

describe('ordersBackend mapping', () => {
  it('maps every status both ways', () => {
    for (const status of ORDER_STATUSES) {
      expect(STATUS_FROM_BACKEND[STATUS_TO_BACKEND[status]]).toBe(status)
    }
    expect(STATUS_TO_BACKEND.PREPARING).toBe('EN_PREPARACION')
    expect(STATUS_TO_BACKEND.CANCELLED).toBe('CANCELADO')
  })

  it('maps a backend order to the frontend model', () => {
    const order = toOrder(backendOrder)

    expect(order).toMatchObject({
      id: '5b70b6e1-1522-478c-9f7b-956c70a523df',
      customerId: 3,
      customerName: '3',
      status: 'PREPARING',
      total: 2 * 15990 + 4990,
      history: [],
    })
    expect(order.items).toEqual([
      { productId: 1, productName: 'Café en grano 1 kg', quantity: 2, unitPrice: 15990 },
      { productId: 'uuid-te', productName: 'Té verde', quantity: 1, unitPrice: 4990 },
    ])
    expect(order.updatedAt).toBe(order.createdAt)
  })

  it('reads backend dates (no timezone) as UTC', () => {
    expect(backendDateToIso('2026-09-27T01:24:22.576232')).toBe('2026-09-27T01:24:22.576Z')
    expect(backendDateToIso('2026-09-27T01:24:22-03:00')).toBe('2026-09-27T04:24:22.000Z')
  })

  it('uses the customer ID supplied by the backend', () => {
    expect(toOrder({ ...backendOrder, cliente_id: 'anonimo' }).customerName).toBe('anonimo')
  })

  it('marks older backend items without a stored price as unknown', () => {
    const order = toOrder({
      ...backendOrder,
      cliente_id: 'front-001',
      items: [{ producto_id: 'uuid-pizza', cantidad: 2 }],
    })

    expect(order.customerName).toBe('front-001')
    expect(order.items[0]).toMatchObject({ productName: 'uuid-pizza', priceKnown: false })
  })

  it('sends item quantities and prices as numbers (the backend subtracts cantidad from stock)', () => {
    const body = toBackendNewOrder({
      customerId: 4,
      customerName: 'Diego Fuentes',
      items: [{ productId: 1, productName: 'Café', quantity: 2, unitPrice: 15990 }],
      total: 31980,
      status: 'CREATED',
      createdAt: '2026-09-27T00:00:00.000Z',
      updatedAt: '2026-09-27T00:00:00.000Z',
      history: [],
    })

    expect(body).toEqual({
      cliente_id: '4',
      items: [{ producto_id: '1', nombre: 'Café', cantidad: 2, precio_unitario: 15990 }],
    })
  })
})

import { catalogService } from '@/features/catalog/services/catalogService'
import { apiClient } from '@/shared/api/apiClient'
import { UnsupportedByBackendError } from '@/shared/api/apiMode'
import { operatorUser } from '@/test/testUsers'
import { InvalidTransitionError } from '../errors'
import type { BackendOrder } from './ordersBackend'
import { ordersService } from './ordersService'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn() },
}))

const stored: BackendOrder = {
  id: 'uuid-order',
  cliente_id: '3',
  items: [{ producto_id: 'uuid-cafe', nombre: 'Café', cantidad: '2', precio_unitario: '15990' }],
  estado: 'CREADO',
  fecha_creacion: '2026-09-27T01:00:00',
}

const reply = (data: unknown) => ({ data }) as never

describe('backend services', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates an order with the backend body and maps the response', async () => {
    vi.mocked(apiClient.post).mockResolvedValue(reply(stored))

    const order = await ordersService.create({
      customerId: 3,
      customerName: 'Valentina Rojas',
      items: [{ productId: 'uuid-cafe', productName: 'Café', quantity: 2, unitPrice: 15990 }],
      total: 31980,
      status: 'CREATED',
      createdAt: '2026-09-27T01:00:00.000Z',
      updatedAt: '2026-09-27T01:00:00.000Z',
      history: [],
    })

    expect(apiClient.post).toHaveBeenCalledWith('/api/orders', {
      cliente_id: '3',
      items: [{ producto_id: 'uuid-cafe', nombre: 'Café', cantidad: 2, precio_unitario: 15990 }],
    })
    expect(order).toMatchObject({ id: 'uuid-order', status: 'CREATED', total: 31980 })
  })

  it('gets an order by UUID', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(reply(stored))

    const order = await ordersService.getById('uuid-order')

    expect(apiClient.get).toHaveBeenCalledWith('/api/orders/uuid-order')
    expect(order.customerName).toBe('3')
  })

  it('changes status with the backend status name and does not touch stock', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(reply(stored))
    vi.mocked(apiClient.patch).mockResolvedValue(reply({ ...stored, estado: 'ACEPTADO' }))
    const current = await ordersService.getById('uuid-order')

    const updated = await ordersService.changeStatus(current, 'ACCEPTED', operatorUser)

    expect(apiClient.patch).toHaveBeenCalledTimes(1)
    expect(apiClient.patch).toHaveBeenCalledWith('/api/orders/uuid-order/estado', {
      estado: 'ACEPTADO',
    })
    expect(updated.status).toBe('ACCEPTED')
  })

  it('still enforces the state machine before calling the backend', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(reply(stored))
    const current = await ordersService.getById('uuid-order')

    await expect(
      ordersService.changeStatus(current, 'DELIVERED', operatorUser),
    ).rejects.toBeInstanceOf(InvalidTransitionError)
    expect(apiClient.patch).not.toHaveBeenCalled()
  })

  it('lists backend orders for a customer, newest first', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      reply([
        { ...stored, id: 'older-order', cliente_id: 'front-001' },
        {
          ...stored,
          id: 'newer-order',
          cliente_id: 'front-001',
          fecha_creacion: '2026-09-28T21:50:04.203090',
          items: [{ producto_id: 'uuid-cafe', cantidad: 2 }],
        },
      ]),
    )

    const orders = await ordersService.list({ customerId: 'front-001' })

    expect(apiClient.get).toHaveBeenCalledWith('/api/orders', {
      params: { cliente_id: 'front-001' },
    })
    expect(orders.map((order) => order.id)).toEqual(['newer-order', 'older-order'])
    expect(orders[0].customerName).toBe('front-001')
    expect(orders[0].items[0].priceKnown).toBe(false)
  })

  it('keeps unsupported catalog operations disabled', async () => {
    await expect(catalogService.setActive('x', false)).rejects.toBeInstanceOf(
      UnsupportedByBackendError,
    )
    expect(apiClient.get).not.toHaveBeenCalled()
    expect(apiClient.patch).not.toHaveBeenCalled()
  })

  it('edits a product with PATCH /api/catalog/{id} (only nombre and precio)', async () => {
    vi.mocked(apiClient.patch).mockResolvedValue(
      reply({ id: 'uuid-cafe', nombre: 'Café molido', precio: 16990, stock: 10 }),
    )

    const updated = await catalogService.update('uuid-cafe', {
      sku: '',
      name: 'Café molido',
      description: '',
      price: 16990,
      imageUrl: '',
    })

    expect(apiClient.patch).toHaveBeenCalledWith('/api/catalog/uuid-cafe', {
      nombre: 'Café molido',
      precio: 16990,
    })
    expect(updated).toMatchObject({ name: 'Café molido', price: 16990, stock: 10 })
  })

  it('gets a single product from the list (the backend has no GET by id)', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      reply([{ id: 'uuid-cafe', nombre: 'Café', precio: 15990, stock: 10 }]),
    )

    await expect(catalogService.getById('uuid-cafe')).resolves.toMatchObject({ name: 'Café' })
    await expect(catalogService.getById('otro')).rejects.toThrow('El producto no existe')
    expect(apiClient.get).toHaveBeenCalledWith('/api/catalog')
  })

  it('lists, creates and adjusts products with the backend contract', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(
      reply([{ id: 'uuid-cafe', nombre: 'Café', precio: '15990', stock: '10' }]),
    )
    const [product] = await catalogService.list()
    expect(apiClient.get).toHaveBeenCalledWith('/api/catalog')
    expect(product).toMatchObject({ id: 'uuid-cafe', name: 'Café', price: 15990, stock: 10 })

    vi.mocked(apiClient.post).mockResolvedValue(
      reply({ id: 'uuid-new', nombre: 'Té', precio: 4990, stock: 5 }),
    )
    await catalogService.create({
      sku: '',
      name: 'Té',
      description: '',
      price: 4990,
      stock: 5,
      active: true,
      imageUrl: '',
    })
    expect(apiClient.post).toHaveBeenCalledWith('/api/catalog', {
      nombre: 'Té',
      precio: 4990,
      stock: 5,
    })

    vi.mocked(apiClient.patch).mockResolvedValue(reply({ id: 'uuid-cafe', nuevo_stock: 7 }))
    const adjusted = await catalogService.adjustStock(product, -3)
    expect(apiClient.patch).toHaveBeenCalledWith('/api/catalog/uuid-cafe/stock', { cantidad: -3 })
    expect(adjusted.stock).toBe(7)
  })

})

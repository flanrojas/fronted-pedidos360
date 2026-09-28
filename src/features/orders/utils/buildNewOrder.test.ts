import { sampleProducts } from '@/test/fixtures/products'
import { customerUser, operatorUser } from '@/test/testUsers'
import { buildNewOrder } from './buildNewOrder'

describe('buildNewOrder', () => {
  const now = new Date('2026-09-26T15:00:00.000Z')

  it('creates a CREATED order with snapshots, total and first history entry', () => {
    const order = buildNewOrder({
      customer: customerUser,
      lines: [
        { productId: 1, quantity: 2 },
        { productId: 4, quantity: 1 },
      ],
      products: sampleProducts,
      createdBy: operatorUser,
      now,
    })

    expect(order).toEqual({
      customerId: 3,
      customerName: 'Valentina Rojas',
      items: [
        { productId: 1, productName: 'Café en grano 1 kg', quantity: 2, unitPrice: 15990 },
        { productId: 4, productName: 'Leche de almendras 1 L', quantity: 1, unitPrice: 3290 },
      ],
      total: 35270,
      status: 'CREATED',
      createdAt: '2026-09-26T15:00:00.000Z',
      updatedAt: '2026-09-26T15:00:00.000Z',
      history: [{ status: 'CREATED', at: '2026-09-26T15:00:00.000Z', by: 'Carlos Muñoz' }],
    })
  })

  it('throws if a product does not exist', () => {
    expect(() =>
      buildNewOrder({
        customer: customerUser,
        lines: [{ productId: 999, quantity: 1 }],
        products: sampleProducts,
        createdBy: customerUser,
      }),
    ).toThrow('Producto 999 no encontrado')
  })
})

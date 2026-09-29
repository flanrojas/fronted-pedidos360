import { toBackendNewProduct, toNumber, toProduct } from './catalogBackend'

describe('catalogBackend mapping', () => {
  it('maps a backend product, filling fields the backend lacks with neutral values', () => {
    expect(toProduct({ id: 'uuid-1', nombre: 'Café', precio: 15990, stock: 10 })).toEqual({
      id: 'uuid-1',
      sku: '',
      name: 'Café',
      description: '',
      price: 15990,
      stock: 10,
      active: true,
      imageUrl: '',
    })
  })

  it('accepts numeric strings and a missing stock', () => {
    const product = toProduct({ id: 'uuid-2', nombre: 'Té', precio: '4990' })
    expect(product.price).toBe(4990)
    expect(product.stock).toBe(0)
  })

  it('associates the local pizza photo only with Pizza Margarita from the backend', () => {
    const pizza = toProduct({ id: 'pizza-1', nombre: '  PIZZA MARGARITA  ', precio: 8990, stock: 8 })
    const other = toProduct({ id: 'pizza-2', nombre: 'Pizza Napolitana', precio: 8990, stock: 8 })

    expect(pizza.imageUrl).toBe('/images/products/pizza-margarita.jpg')
    expect(other.imageUrl).toBe('')
  })

  it('associates the local burger photo with Hamburguesa Doble Queso', () => {
    const burger = toProduct({
      id: 'burger-1',
      nombre: ' HAMBURGUESA DOBLE QUESO ',
      precio: 9990,
      stock: 6,
    })

    expect(burger.imageUrl).toBe('/images/products/hamburguesa-doble-queso.jpg')
  })

  it('associates rustic fries with the photo regardless of the accent', () => {
    for (const nombre of ['Papas Fritas Rusticas', 'Papas Fritas Rústicas']) {
      expect(toProduct({ id: 'fries-1', nombre, precio: 4990, stock: 4 }).imageUrl)
        .toBe('/images/products/papas-fritas-rusticas.jpg')
    }
  })

  it('converts a new product to the backend body (only nombre, precio, stock)', () => {
    expect(
      toBackendNewProduct({
        sku: 'IGNORED',
        name: 'Café',
        description: 'ignored',
        price: 15990,
        stock: 10,
        active: true,
        imageUrl: '/x.jpg',
      }),
    ).toEqual({ nombre: 'Café', precio: 15990, stock: 10 })
  })

  it('toNumber falls back to 0 for invalid values', () => {
    expect(toNumber('12')).toBe(12)
    expect(toNumber('abc')).toBe(0)
    expect(toNumber(undefined)).toBe(0)
  })
})

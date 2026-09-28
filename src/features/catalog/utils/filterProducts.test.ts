import type { Product } from '../types'
import { filterProducts } from './filterProducts'

const product = (id: number, sku: string, name: string, active = true): Product => ({
  id,
  sku,
  name,
  description: '',
  price: 1000,
  stock: 1,
  active,
})

const products = [
  product(1, 'CAF-001', 'Café en grano'),
  product(2, 'TE-002', 'Té verde'),
  product(3, 'CAP-008', 'Cápsulas', false),
]

const ids = (list: Product[]) => list.map((p) => p.id)

describe('filterProducts', () => {
  it('returns everything with no filters', () => {
    expect(ids(filterProducts(products, { search: '', status: 'all' }))).toEqual([1, 2, 3])
  })

  it('searches by name, case-insensitive', () => {
    expect(ids(filterProducts(products, { search: 'VERDE', status: 'all' }))).toEqual([2])
  })

  it('searches by SKU', () => {
    expect(ids(filterProducts(products, { search: 'cap-', status: 'all' }))).toEqual([3])
  })

  it('filters by active status', () => {
    expect(ids(filterProducts(products, { search: '', status: 'active' }))).toEqual([1, 2])
    expect(ids(filterProducts(products, { search: '', status: 'inactive' }))).toEqual([3])
  })

  it('combines search and status', () => {
    expect(ids(filterProducts(products, { search: 'ca', status: 'active' }))).toEqual([1])
  })
})

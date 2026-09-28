import type { Product, ProductStatusFilter } from '../types'

interface ProductFilters {
  search: string
  status: ProductStatusFilter
}

/** Filters by name or SKU (case-insensitive) and by active status. */
export function filterProducts(products: readonly Product[], { search, status }: ProductFilters) {
  const term = search.trim().toLowerCase()

  return products.filter((product) => {
    if (status === 'active' && !product.active) return false
    if (status === 'inactive' && product.active) return false
    if (!term) return true
    return product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term)
  })
}

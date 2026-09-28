import { apiClient } from '@/shared/api/apiClient'
import type { NewProduct, Product, ProductUpdate } from '../types'

export const catalogService = {
  async list(): Promise<Product[]> {
    const { data } = await apiClient.get<Product[]>('/products')
    return data
  },

  async getById(id: number): Promise<Product> {
    const { data } = await apiClient.get<Product>(`/products/${id}`)
    return data
  },

  async create(product: NewProduct): Promise<Product> {
    const { data } = await apiClient.post<Product>('/products', product)
    return data
  },

  async update(id: number, changes: ProductUpdate): Promise<Product> {
    const { data } = await apiClient.patch<Product>(`/products/${id}`, changes)
    return data
  },

  /** Soft delete: products are never removed, only deactivated. */
  async setActive(id: number, active: boolean): Promise<Product> {
    const { data } = await apiClient.patch<Product>(`/products/${id}`, { active })
    return data
  },

  async updateStock(id: number, stock: number): Promise<Product> {
    if (!Number.isInteger(stock) || stock < 0) {
      throw new Error('El stock debe ser un entero mayor o igual a 0')
    }
    const { data } = await apiClient.patch<Product>(`/products/${id}`, { stock })
    return data
  },
}

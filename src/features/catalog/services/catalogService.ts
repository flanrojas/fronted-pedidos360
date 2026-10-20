import { apiClient } from '@/shared/api/apiClient'
import { UnsupportedByBackendError } from '@/shared/api/apiMode'
import type { EntityId } from '@/shared/utils/entityId'
import type { NewProduct, Product, ProductUpdate } from '../types'
import { toBackendNewProduct, toBackendProductUpdate, toProduct, type BackendProduct } from './catalogBackend'

export const catalogService = {
  async list(): Promise<Product[]> {
    const { data } = await apiClient.get<BackendProduct[]>('/api/catalog')
    return data.map(toProduct)
  },

  async getById(id: EntityId): Promise<Product> {
    const product = (await catalogService.list()).find((item) => item.id === id)
    if (!product) throw new Error('El producto no existe')
    return product
  },

  async create(product: NewProduct): Promise<Product> {
    const { data } = await apiClient.post<BackendProduct>('/api/catalog', toBackendNewProduct(product))
    return toProduct(data)
  },

  async update(id: EntityId, changes: ProductUpdate): Promise<Product> {
    const { data } = await apiClient.patch<BackendProduct>(`/api/catalog/${id}`, toBackendProductUpdate(changes))
    return toProduct(data)
  },

  /** Permanent delete. Only Administrador (the backend answers 403 otherwise, 404 if missing). */
  async remove(id: EntityId): Promise<void> {
    await apiClient.delete(`/api/catalog/${id}`)
  },

  async setActive(id: EntityId, active: boolean): Promise<Product> {
    void id
    void active
    throw new UnsupportedByBackendError('activar o desactivar productos')
  },

  async adjustStock(product: Pick<Product, 'id' | 'stock'>, delta: number): Promise<Product> {
    const stock = product.stock + delta
    if (!Number.isInteger(delta) || !Number.isInteger(stock) || stock < 0) {
      throw new Error('El stock debe ser un entero mayor o igual a 0')
    }
    const { data } = await apiClient.patch<{ id: string; nuevo_stock: number }>(
      `/api/catalog/${product.id}/stock`,
      { cantidad: delta },
    )
    return { ...(product as Product), stock: data.nuevo_stock }
  },
}

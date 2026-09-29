import type { EntityId } from '@/shared/utils/entityId'

export interface Product {
  id: EntityId
  sku: string
  name: string
  description: string
  price: number
  stock: number
  active: boolean
  imageUrl?: string
}

export type NewProduct = Omit<Product, 'id'>

export type ProductUpdate = Pick<Product, 'sku' | 'name' | 'description' | 'price' | 'imageUrl'>

export type ProductStatusFilter = 'all' | 'active' | 'inactive'

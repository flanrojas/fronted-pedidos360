import { parseId } from '@/shared/utils/entityId'
import type { NewProduct, Product, ProductUpdate } from '../types'

const LOCAL_PRODUCT_IMAGES: Record<string, string> = {
  'pizza margarita': '/images/products/pizza-margarita.jpg',
  'hamburguesa doble queso': '/images/products/hamburguesa-doble-queso.jpg',
  'sushi roll avocado (10 uds)': '/images/products/sushi-roll-avocado.jpg',
  'papas fritas rusticas': '/images/products/papas-fritas-rusticas.jpg',
}

function localProductImage(name: string): string {
  const normalizedName = name.trim().toLocaleLowerCase('es').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  return LOCAL_PRODUCT_IMAGES[normalizedName] ?? ''
}

export interface BackendProduct {
  id: string
  nombre: string
  precio: number | string
  stock?: number | string
}

export interface BackendNewProduct {
  nombre: string
  precio: number
  stock: number
}

export function toNumber(value: number | string | undefined): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export function toProduct(product: BackendProduct): Product {
  return {
    id: parseId(product.id),
    sku: '',
    name: product.nombre,
    description: '',
    price: toNumber(product.precio),
    stock: toNumber(product.stock),
    active: true,
    imageUrl: localProductImage(product.nombre),
  }
}

export function toBackendNewProduct(product: NewProduct): BackendNewProduct {
  return { nombre: product.name, precio: product.price, stock: product.stock }
}

export function toBackendProductUpdate(changes: ProductUpdate): { nombre: string; precio: number } {
  return { nombre: changes.name, precio: changes.price }
}

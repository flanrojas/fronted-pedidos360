import type { Product } from '@/features/catalog/types'

export const sampleProducts: Product[] = [
  {
    id: 1,
    sku: 'CAF-001',
    name: 'Café en grano 1 kg',
    description: 'Café de especialidad.',
    price: 15990,
    stock: 40,
    active: true,
    imageUrl: '/images/products/caf-001.jpg',
  },
  {
    id: 4,
    sku: 'LEC-004',
    name: 'Leche de almendras 1 L',
    description: '',
    price: 3290,
    stock: 0,
    active: true,
  },
  {
    id: 8,
    sku: 'CAP-008',
    name: 'Cápsulas compatibles',
    description: '',
    price: 3990,
    stock: 8,
    active: false,
  },
]

import { z } from 'zod'
import type { EntityId } from '@/shared/utils/entityId'
import type { Product } from '../types'
import { isValidImageUrl } from '../utils/productImage'

const integerField = (label: string) =>
  z.number({ error: `${label} es obligatorio` }).refine((value) => Number.isInteger(value), {
    error: `${label} debe ser un número entero`,
    abort: true,
  })

export function createProductSchema(
  existingProducts: ReadonlyArray<Pick<Product, 'id' | 'sku'>>,
  currentId?: EntityId,
  { requireSku = true }: { requireSku?: boolean } = {},
) {
  const takenSkus = new Set(
    existingProducts
      .filter((product) => product.id !== currentId)
      .map((product) => product.sku.trim().toUpperCase()),
  )

  return z.object({
    sku: requireSku
      ? z
          .string()
          .trim()
          .min(1, { error: 'El SKU es obligatorio' })
          .refine((sku) => !takenSkus.has(sku.toUpperCase()), {
            error: 'Ya existe un producto con este SKU',
          })
      : z.string().trim(),
    name: z.string().trim().min(3, { error: 'El nombre debe tener al menos 3 caracteres' }),
    description: z.string().trim(),
    price: integerField('El precio').refine((value) => value > 0, {
      error: 'El precio debe ser mayor a 0',
    }),
    stock: integerField('El stock').refine((value) => value >= 0, {
      error: 'El stock no puede ser negativo',
    }),
    imageUrl: z.string().trim().refine(isValidImageUrl, {
      error: 'Ingresa una URL válida (http/https) o sube una imagen JPG, PNG o WebP',
    }),
  })
}

export type ProductFormValues = z.infer<ReturnType<typeof createProductSchema>>

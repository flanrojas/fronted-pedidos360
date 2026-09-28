import { z } from 'zod'
import type { Product } from '../types'
import { isValidImageUrl } from '../utils/productImage'

// Empty numeric inputs arrive as NaN (valueAsNumber); z.number() rejects NaN with this message.
const integerField = (label: string) =>
  z.number({ error: `${label} es obligatorio` }).refine((value) => Number.isInteger(value), {
    error: `${label} debe ser un número entero`,
    abort: true,
  })

/**
 * Builds the product form schema. The SKU must be unique (case-insensitive)
 * among `existingProducts`, ignoring the product being edited (`currentId`).
 */
export function createProductSchema(
  existingProducts: ReadonlyArray<Pick<Product, 'id' | 'sku'>>,
  currentId?: number,
) {
  const takenSkus = new Set(
    existingProducts
      .filter((product) => product.id !== currentId)
      .map((product) => product.sku.trim().toUpperCase()),
  )

  return z.object({
    sku: z
      .string()
      .trim()
      .min(1, { error: 'El SKU es obligatorio' })
      .refine((sku) => !takenSkus.has(sku.toUpperCase()), {
        error: 'Ya existe un producto con este SKU',
      }),
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

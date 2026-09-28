import { z } from 'zod'
import { applyStockAdjustment } from '../utils/stockAdjustment'

export function createAdjustStockSchema(currentStock: number) {
  return z
    .object({
      mode: z.enum(['add', 'subtract']),
      quantity: z
        .number({ error: 'La cantidad es obligatoria' })
        .refine((value) => Number.isInteger(value), {
          error: 'La cantidad debe ser un número entero',
          abort: true,
        })
        .refine((value) => value > 0, { error: 'La cantidad debe ser mayor a 0' }),
    })
    .refine(({ mode, quantity }) => applyStockAdjustment(currentStock, mode, quantity) >= 0, {
      error: `El stock no puede quedar negativo (máximo a restar: ${currentStock})`,
      path: ['quantity'],
    })
}

export type AdjustStockFormValues = z.infer<ReturnType<typeof createAdjustStockSchema>>

import { z } from 'zod'
import { isValidId, type EntityId } from '@/shared/utils/entityId'

const entityId = z.custom<EntityId>((value) => isValidId(value as EntityId), {
  error: 'Ingresa un ID de cliente válido',
})

export const orderFormSchema = z.object({
  customerId: entityId,
  items: z
    .array(
      z.object({
        productId: entityId,
        quantity: z
          .number({ error: 'Ingresa una cantidad' })
          .refine((value) => Number.isInteger(value), {
            error: 'Debe ser un número entero',
            abort: true,
          })
          .refine((value) => value >= 1, { error: 'Mínimo 1' }),
      }),
    )
    .min(1, { error: 'Agrega al menos un producto al pedido' }),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>

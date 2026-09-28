import { z } from 'zod'

export const orderFormSchema = z.object({
  customerId: z
    .number({ error: 'Selecciona un cliente' })
    .refine((id) => Number.isInteger(id) && id > 0, { error: 'Selecciona un cliente' }),
  items: z
    .array(
      z.object({
        productId: z.number(),
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

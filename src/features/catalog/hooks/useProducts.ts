import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { catalogService } from '../services/catalogService'
import type { NewProduct, ProductUpdate } from '../types'

export const PRODUCTS_KEY = ['products'] as const

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: catalogService.list,
  })
}

export function useProduct(id: number | undefined) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => catalogService.getById(id as number),
    enabled: id !== undefined && Number.isInteger(id),
  })
}

function useInvalidateProducts() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: PRODUCTS_KEY })
}

export function useCreateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (product: NewProduct) => catalogService.create(product),
    onSuccess: invalidate,
  })
}

export function useUpdateProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ id, changes }: { id: number; changes: ProductUpdate }) =>
      catalogService.update(id, changes),
    onSuccess: invalidate,
  })
}

export function useSetProductActive() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      catalogService.setActive(id, active),
    onSuccess: invalidate,
  })
}

export function useUpdateProductStock() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ id, stock }: { id: number; stock: number }) =>
      catalogService.updateStock(id, stock),
    onSuccess: invalidate,
  })
}

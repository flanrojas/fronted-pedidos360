import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { isValidId, type EntityId } from '@/shared/utils/entityId'
import { catalogService } from '../services/catalogService'
import type { NewProduct, Product, ProductUpdate } from '../types'

export const PRODUCTS_KEY = ['products'] as const

export function useProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: catalogService.list,
  })
}

export function useProduct(id: EntityId | undefined, { enabled = true } = {}) {
  return useQuery({
    queryKey: [...PRODUCTS_KEY, id],
    queryFn: () => catalogService.getById(id as EntityId),
    enabled: enabled && isValidId(id),
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
    mutationFn: ({ id, changes }: { id: EntityId; changes: ProductUpdate }) =>
      catalogService.update(id, changes),
    onSuccess: invalidate,
  })
}

export function useDeleteProduct() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: (id: EntityId) => catalogService.remove(id),
    onSuccess: invalidate,
  })
}

export function useSetProductActive() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ id, active }: { id: EntityId; active: boolean }) =>
      catalogService.setActive(id, active),
    onSuccess: invalidate,
  })
}

export function useAdjustProductStock() {
  const invalidate = useInvalidateProducts()
  return useMutation({
    mutationFn: ({ product, delta }: { product: Product; delta: number }) =>
      catalogService.adjustStock(product, delta),
    onSuccess: invalidate,
  })
}

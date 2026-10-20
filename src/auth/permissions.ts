import type { Role } from './types'

export type Action =
  | 'catalog:view'
  | 'catalog:manage'
  | 'catalog:delete'
  | 'orders:view'
  | 'orders:viewAll'
  | 'orders:create'
  | 'orders:changeStatus'

const PERMISSIONS: Record<Action, readonly Role[]> = {
  'catalog:view': ['ADMIN', 'OPERATOR'],
  'catalog:manage': ['ADMIN'],
  // Permanent delete (DELETE /api/catalog/{id}); the backend also requires Administrador.
  'catalog:delete': ['ADMIN'],
  'orders:view': ['ADMIN', 'OPERATOR', 'CUSTOMER'],
  'orders:viewAll': ['ADMIN', 'OPERATOR'],
  'orders:create': ['OPERATOR', 'CUSTOMER'],
  'orders:changeStatus': ['ADMIN', 'OPERATOR'],
}

export function can(role: Role, action: Action): boolean {
  return PERMISSIONS[action].includes(role)
}

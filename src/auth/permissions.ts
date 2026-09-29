import type { Role } from './types'

export type Action =
  | 'catalog:view'
  | 'catalog:manage'
  | 'orders:view'
  | 'orders:viewAll'
  | 'orders:create'
  | 'orders:changeStatus'

const PERMISSIONS: Record<Action, readonly Role[]> = {
  'catalog:view': ['ADMIN', 'OPERATOR'],
  'catalog:manage': ['ADMIN'],
  'orders:view': ['ADMIN', 'OPERATOR', 'CUSTOMER'],
  'orders:viewAll': ['ADMIN', 'OPERATOR'],
  'orders:create': ['OPERATOR', 'CUSTOMER'],
  'orders:changeStatus': ['ADMIN', 'OPERATOR'],
}

export function can(role: Role, action: Action): boolean {
  return PERMISSIONS[action].includes(role)
}

import type { EntityId } from '@/shared/utils/entityId'

export type Role = 'ADMIN' | 'OPERATOR' | 'CUSTOMER'

export interface User {
  id: EntityId
  name: string
  email: string
  role: Role
}

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  OPERATOR: 'Operador',
  CUSTOMER: 'Cliente',
}

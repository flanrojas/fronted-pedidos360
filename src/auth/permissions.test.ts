import { can, type Action } from './permissions'
import type { Role } from './types'

const EXPECTED: Record<Action, Record<Role, boolean>> = {
  'catalog:view': { ADMIN: true, OPERATOR: true, CUSTOMER: false },
  'catalog:manage': { ADMIN: true, OPERATOR: false, CUSTOMER: false },
  'catalog:delete': { ADMIN: true, OPERATOR: false, CUSTOMER: false },
  'orders:view': { ADMIN: true, OPERATOR: true, CUSTOMER: true },
  'orders:viewAll': { ADMIN: true, OPERATOR: true, CUSTOMER: false },
  'orders:create': { ADMIN: false, OPERATOR: true, CUSTOMER: true },
  'orders:changeStatus': { ADMIN: true, OPERATOR: true, CUSTOMER: false },
}

const cases = Object.entries(EXPECTED).flatMap(([action, byRole]) =>
  Object.entries(byRole).map(([role, allowed]) => ({
    action: action as Action,
    role: role as Role,
    allowed,
  })),
)

describe('can', () => {
  it.each(cases)('$role → $action = $allowed', ({ role, action, allowed }) => {
    expect(can(role, action)).toBe(allowed)
  })

  it('CUSTOMER cannot see the catalog', () => {
    expect(can('CUSTOMER', 'catalog:view')).toBe(false)
  })

  it('only ADMIN can manage products and stock', () => {
    expect(can('ADMIN', 'catalog:manage')).toBe(true)
    expect(can('OPERATOR', 'catalog:manage')).toBe(false)
  })

  it('ADMIN cannot create orders', () => {
    expect(can('ADMIN', 'orders:create')).toBe(false)
  })
})

import type { AuthenticationResult } from '@azure/msal-browser'
import type { Role, User } from './types'

const ROLE_MAP: Record<string, Role> = {
  Admin: 'ADMIN',
  Administrador: 'ADMIN',
  Operador: 'OPERATOR',
  Cliente: 'CUSTOMER',
}

function tokenClaims(accessToken: string): Record<string, unknown> | null {
  try {
    const payload = accessToken.split('.')[1]
    const padded = payload.replace(/-/g, '+').replace(/_/g, '/')
    const claims: unknown = JSON.parse(atob(padded))
    return claims && typeof claims === 'object' ? claims as Record<string, unknown> : null
  } catch {
    return null
  }
}

export function userFromToken(result: AuthenticationResult): User | null {
  const claims = tokenClaims(result.accessToken)
  const roles = Array.isArray(claims?.roles) ? claims.roles : []
  const role = Object.keys(ROLE_MAP)
    .filter((value) => roles.includes(value))
    .map((value) => ROLE_MAP[value])[0]
  if (!role) return null

  const id = claims?.sub
  if (typeof id !== 'string' || !id) return null
  const account = result.account
  return {
    id,
    name: account.name ?? account.username,
    email: account.username,
    role,
  }
}

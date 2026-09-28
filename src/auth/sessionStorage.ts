import type { Role, User } from './types'

const STORAGE_KEY = 'pedidos360.currentUser'
const ROLES: readonly Role[] = ['ADMIN', 'OPERATOR', 'CUSTOMER']

function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'number' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    ROLES.includes(candidate.role as Role)
  )
}

export function readStoredUser(): User | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isUser(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function storeUser(user: User | null): void {
  try {
    if (user) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    } else {
      sessionStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // sessionStorage unavailable (e.g. private mode): the session lives only in memory.
  }
}

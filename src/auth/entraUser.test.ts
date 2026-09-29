import type { AuthenticationResult } from '@azure/msal-browser'
import { userFromToken } from './entraUser'

function result(claims: Record<string, unknown>): AuthenticationResult {
  const encoded = btoa(JSON.stringify(claims))
  return {
    accessToken: `header.${encoded}.signature`,
    account: { name: 'Ana Pérez', username: 'ana@example.com' },
  } as AuthenticationResult
}

describe('userFromToken', () => {
  it.each([
    ['Admin', 'ADMIN'],
    ['Operador', 'OPERATOR'],
    ['Cliente', 'CUSTOMER'],
  ])('maps the API role %s and its subject to the frontend user', (backendRole, frontendRole) => {
    expect(userFromToken(result({ roles: [backendRole], sub: 'entra-sub-123' }))).toEqual({
      id: 'entra-sub-123',
      name: 'Ana Pérez',
      email: 'ana@example.com',
      role: frontendRole,
    })
  })

  it('does not grant access when the API token has no supported role', () => {
    expect(userFromToken(result({ roles: ['Lector'], sub: 'entra-sub-123' }))).toBeNull()
  })
})

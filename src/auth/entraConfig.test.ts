import { apiScopes, missingEntraSettings } from './entraConfig'

describe('Microsoft Entra configuration', () => {
  it('requests all configured scopes for the same API', () => {
    vi.stubEnv('VITE_ENTRA_API_SCOPES', 'api://pedidos/orders.read, api://pedidos/orders.write,api://pedidos/catalog.read')
    expect(apiScopes()).toEqual([
      'api://pedidos/orders.read',
      'api://pedidos/orders.write',
      'api://pedidos/catalog.read',
    ])
  })

  it('reports missing values without exposing their contents', () => {
    vi.stubEnv('VITE_ENTRA_TENANT_ID', '')
    vi.stubEnv('VITE_ENTRA_CLIENT_ID', '')
    vi.stubEnv('VITE_ENTRA_API_SCOPES', '')
    vi.stubEnv('VITE_ENTRA_REDIRECT_URI', 'http://localhost:5173/')
    expect(missingEntraSettings()).toEqual([
      'VITE_ENTRA_TENANT_ID',
      'VITE_ENTRA_CLIENT_ID',
      'VITE_ENTRA_API_SCOPES',
    ])
  })
})

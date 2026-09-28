import { screen } from '@testing-library/react'
import type { RouteObject } from 'react-router'
import { renderWithProviders } from '@/test/renderWithProviders'
import { adminUser, customerUser } from '@/test/testUsers'
import { RoleGuard } from './RoleGuard'

const routes: RouteObject[] = [
  { path: '/login', element: <h1>Página de login</h1> },
  { path: '/403', element: <h1>Acceso denegado</h1> },
  {
    element: <RoleGuard action="catalog:view" />,
    children: [{ path: '/catalog', element: <h1>Contenido del catálogo</h1> }],
  },
  {
    element: <RoleGuard />,
    children: [{ path: '/orders', element: <h1>Contenido de pedidos</h1> }],
  },
]

describe('RoleGuard', () => {
  it('redirects to /login when there is no session', async () => {
    const { router } = renderWithProviders({ user: null, initialPath: '/catalog', routes })

    expect(await screen.findByRole('heading', { name: 'Página de login' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('redirects to /login on a session-only route when there is no session', async () => {
    const { router } = renderWithProviders({ user: null, initialPath: '/orders', routes })

    expect(await screen.findByRole('heading', { name: 'Página de login' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/login')
  })

  it('redirects to /403 when the role lacks the permission', async () => {
    const { router } = renderWithProviders({ user: customerUser, initialPath: '/catalog', routes })

    expect(await screen.findByRole('heading', { name: 'Acceso denegado' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/403')
  })

  it('renders the content when the role has the permission', async () => {
    renderWithProviders({ user: adminUser, initialPath: '/catalog', routes })

    expect(
      await screen.findByRole('heading', { name: 'Contenido del catálogo' }),
    ).toBeInTheDocument()
  })
})

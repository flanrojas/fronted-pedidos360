import { screen, within } from '@testing-library/react'
import { renderWithProviders } from '@/test/renderWithProviders'
import { adminUser, customerUser, operatorUser } from '@/test/testUsers'
import { catalogService } from '@/features/catalog/services/catalogService'
import { ordersService } from '@/features/orders/services/ordersService'
import { usersService } from '@/features/users/services/usersService'
import { routes } from './routes'

vi.mock('@/features/orders/services/ordersService')
vi.mock('@/features/users/services/usersService')
vi.mock('@/features/catalog/services/catalogService')

function getMenu() {
  return screen.getByRole('navigation', { name: 'Menú principal' })
}

describe('AppLayout', () => {
  beforeEach(() => {
    vi.mocked(ordersService.list).mockResolvedValue([])
    vi.mocked(usersService.list).mockResolvedValue([])
    vi.mocked(catalogService.list).mockResolvedValue([])
  })

  it('CUSTOMER does not see "Catálogo" in the menu', async () => {
    renderWithProviders({ user: customerUser, initialPath: '/orders', routes })

    await screen.findByRole('heading', { name: 'Mis pedidos' })
    expect(within(getMenu()).getByText('Pedidos')).toBeInTheDocument()
    expect(within(getMenu()).queryByText('Catálogo')).not.toBeInTheDocument()
  })

  it.each([adminUser, operatorUser])('$role sees Pedidos and Catálogo', async (user) => {
    renderWithProviders({ user, initialPath: '/orders', routes })

    await screen.findByRole('heading', { name: 'Pedidos' })
    expect(within(getMenu()).getByText('Pedidos')).toBeInTheDocument()
    expect(within(getMenu()).getByText('Catálogo')).toBeInTheDocument()
  })

  it('CUSTOMER entering /catalog lands on /403', async () => {
    const { router } = renderWithProviders({ user: customerUser, initialPath: '/catalog', routes })

    expect(await screen.findByRole('heading', { name: 'Acceso denegado' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/403')
  })

  it('shows the user name and role in the AppBar', async () => {
    renderWithProviders({ user: operatorUser, initialPath: '/orders', routes })

    expect(await screen.findByText('Carlos Muñoz')).toBeInTheDocument()
    expect(screen.getByText('Operador')).toBeInTheDocument()
  })

  it('redirects / to /orders', async () => {
    const { router } = renderWithProviders({ user: adminUser, initialPath: '/', routes })

    await screen.findByRole('heading', { name: 'Pedidos' })
    expect(router.state.location.pathname).toBe('/orders')
  })

  it('shows the 404 page for unknown routes', async () => {
    renderWithProviders({ user: adminUser, initialPath: '/no-existe', routes })

    expect(await screen.findByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument()
  })

  it.each([
    ['Pedidos', '/pedido.png'],
    ['Catálogo', '/catalogar.png'],
  ])('shows the custom icon for %s in the menu', async (label, src) => {
    renderWithProviders({ user: adminUser, initialPath: '/orders', routes })

    await screen.findByRole('heading', { name: 'Pedidos' })
    const link = within(getMenu()).getByRole('link', { name: label })
    const icon = link.querySelector('img')
    expect(icon).toHaveAttribute('src', src)
    expect(icon).toHaveAttribute('alt', '')
  })
})

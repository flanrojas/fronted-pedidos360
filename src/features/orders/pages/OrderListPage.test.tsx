import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router'
import type { User } from '@/auth/types'
import { makeOrder } from '@/test/fixtures/orders'
import { renderWithProviders } from '@/test/renderWithProviders'
import { customerUser, operatorUser, otherCustomerUser } from '@/test/testUsers'
import { ordersService } from '../services/ordersService'
import { OrderListPage } from './OrderListPage'

vi.mock('../services/ordersService')

const routes: RouteObject[] = [
  { path: '/orders', element: <OrderListPage /> },
  { path: '/orders/:id', element: <h1>Detalle</h1> },
]

const allOrders = [
  makeOrder(1, customerUser, 'DELIVERED', [2026, 9, 1]),
  makeOrder(2, otherCustomerUser, 'CREATED', [2026, 9, 10]),
  makeOrder(3, customerUser, 'CREATED', [2026, 9, 20]),
]

function rows() {
  const table = screen.getByRole('table', { name: 'Listado de pedidos' })
  return within(table).getAllByRole('row').slice(1)
}

describe('OrderListPage', () => {
  beforeEach(() => {
    vi.mocked(ordersService.list).mockImplementation(async ({ customerId } = {}) =>
      customerId === undefined ? allOrders : allOrders.filter((o) => o.customerId === customerId),
    )
  })

  it('CUSTOMER only requests and sees their own orders, without customer filter', async () => {
    renderWithProviders({ user: customerUser, initialPath: '/orders', routes })

    await screen.findByRole('table', { name: 'Listado de pedidos' })
    expect(ordersService.list).toHaveBeenCalledWith({ customerId: 3 })
    expect(rows().map((r) => r.getAttribute('aria-label'))).toEqual(['Pedido N° 3', 'Pedido N° 1'])
    expect(screen.queryByRole('combobox', { name: 'Cliente' })).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Nuevo pedido' })).toBeInTheDocument()
  })

  it('OPERATOR sees every order, newest first, with the customer filter', async () => {
    const user = userEvent.setup()
    renderWithProviders({ user: operatorUser, initialPath: '/orders', routes })

    await screen.findByRole('table', { name: 'Listado de pedidos' })
    expect(ordersService.list).toHaveBeenCalledWith({})
    expect(rows()).toHaveLength(3)
    expect(within(rows()[0]).getByText('Creado')).toBeInTheDocument()
    expect(within(rows()[0]).getByText('$31.980')).toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: 'Cliente' }))
    await user.click(await screen.findByRole('option', { name: 'Diego Fuentes' }))
    expect(rows().map((r) => r.getAttribute('aria-label'))).toEqual(['Pedido N° 2'])
  })

  it('filters by status', async () => {
    const user = userEvent.setup()
    renderWithProviders({ user: operatorUser, initialPath: '/orders', routes })
    await screen.findByRole('table', { name: 'Listado de pedidos' })

    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'Entregado' }))
    expect(rows().map((r) => r.getAttribute('aria-label'))).toEqual(['Pedido N° 1'])
  })

  it('opens the detail when clicking a row', async () => {
    const user = userEvent.setup()
    const { router } = renderWithProviders({ user: operatorUser, initialPath: '/orders', routes })
    await screen.findByRole('table', { name: 'Listado de pedidos' })

    await user.click(screen.getByRole('row', { name: 'Pedido N° 2' }))
    expect(router.state.location.pathname).toBe('/orders/2')
  })

  it('shows an empty state when there are no orders', async () => {
    vi.mocked(ordersService.list).mockResolvedValue([])
    renderWithProviders({ user: customerUser, initialPath: '/orders', routes })

    expect(await screen.findByText('Aún no hay pedidos')).toBeInTheDocument()
  })
})

describe('OrderListPage with backend IDs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the current customer’s backend orders', async () => {
    const frontUser: User = {
      id: 'front-001',
      name: 'Cliente front-001',
      email: 'front-001@pedidos360.local',
      role: 'CUSTOMER',
    }
    const order = makeOrder(5, frontUser, 'CREATED', [2026, 9, 28])
    vi.mocked(ordersService.list).mockResolvedValue([{
      ...order,
      id: 'uuid-order',
      total: 0,
      items: order.items.map((item) => ({ ...item, priceKnown: false })),
    }])
    renderWithProviders({ user: frontUser, initialPath: '/orders', routes })

    const table = await screen.findByRole('table', { name: 'Listado de pedidos' })
    expect(ordersService.list).toHaveBeenCalledWith({ customerId: 'front-001' })
    const row = within(table).getByRole('row', { name: 'Pedido N° uuid-order' })
    expect(within(row).getByText('—')).toBeInTheDocument()
    expect(screen.queryByRole('form', { name: 'Buscar pedido' })).not.toBeInTheDocument()
  })
})

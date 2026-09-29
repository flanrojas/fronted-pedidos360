import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router'
import type { User } from '@/auth/types'
import { catalogService } from '@/features/catalog/services/catalogService'
import { sampleProducts } from '@/test/fixtures/products'
import { makeOrder } from '@/test/fixtures/orders'
import { renderWithProviders } from '@/test/renderWithProviders'
import { adminUser, customerUser, operatorUser, otherCustomerUser } from '@/test/testUsers'
import { InsufficientStockError } from '../errors'
import { ordersService } from '../services/ordersService'
import type { Order, OrderStatus } from '../types'
import { OrderDetailPage } from './OrderDetailPage'

vi.mock('../services/ordersService')
vi.mock('@/features/catalog/services/catalogService')

const routes: RouteObject[] = [
  { path: '/orders/:id', element: <OrderDetailPage /> },
  { path: '/403', element: <h1>Acceso denegado</h1> },
]

function renderDetail(order: Order, user: User = operatorUser) {
  vi.mocked(catalogService.list).mockResolvedValue(sampleProducts)
  vi.mocked(ordersService.getById).mockResolvedValue(order)
  return renderWithProviders({ user, initialPath: `/orders/${order.id}`, routes })
}

async function actionNames() {
  const group = await screen.findByRole('group', { name: 'Cambiar estado' })
  return within(group)
    .getAllByRole('button')
    .map((b) => b.textContent)
}

describe('OrderDetailPage', () => {
  it('shows order data, items, total and status', async () => {
    renderDetail(makeOrder(5, customerUser, 'CREATED', [2026, 9, 20]))

    expect(await screen.findByRole('heading', { name: 'Pedido N° 5' })).toBeInTheDocument()
    expect(screen.getByText('Valentina Rojas')).toBeInTheDocument()
    const items = screen.getByRole('table', { name: 'Ítems del pedido' })
    expect(within(items).getByText('Café en grano 1 kg')).toBeInTheDocument()
    expect(screen.getByLabelText('Total del pedido')).toHaveTextContent('$31.980')
    expect(screen.queryByRole('list', { name: 'Historial de estados' })).not.toBeInTheDocument()
  })

  it.each<[OrderStatus, string[]]>([
    ['CREATED', ['Aceptar', 'Cancelar pedido']],
    ['ACCEPTED', ['Pasar a preparación', 'Cancelar pedido']],
    ['PREPARING', ['Despachar']],
    ['DISPATCHED', ['Marcar como entregado']],
  ])('in %s only offers the allowed transitions', async (status, expected) => {
    renderDetail(makeOrder(5, customerUser, status, [2026, 9, 20]))
    expect(await actionNames()).toEqual(expected)
  })

  it('never offers "Despachar" for a non-accepted order', async () => {
    renderDetail(makeOrder(5, customerUser, 'CREATED', [2026, 9, 20]))
    await screen.findByRole('heading', { name: 'Pedido N° 5' })
    expect(screen.queryByRole('button', { name: 'Despachar' })).not.toBeInTheDocument()
  })

  it.each<OrderStatus>(['DELIVERED', 'CANCELLED'])('has no actions when %s', async (status) => {
    renderDetail(makeOrder(5, customerUser, status, [2026, 9, 20]))
    await screen.findByRole('heading', { name: 'Pedido N° 5' })
    expect(screen.queryByRole('group', { name: 'Cambiar estado' })).not.toBeInTheDocument()
  })

  it('ADMIN can also change status', async () => {
    renderDetail(makeOrder(5, customerUser, 'CREATED', [2026, 9, 20]), adminUser)
    expect(await actionNames()).toEqual(['Aceptar', 'Cancelar pedido'])
  })

  it('CUSTOMER sees their own order without actions', async () => {
    renderDetail(makeOrder(5, customerUser, 'CREATED', [2026, 9, 20]), customerUser)
    await screen.findByRole('heading', { name: 'Pedido N° 5' })
    expect(screen.queryByRole('group', { name: 'Cambiar estado' })).not.toBeInTheDocument()
  })

  it("CUSTOMER opening someone else's order goes to /403", async () => {
    const { router } = renderDetail(
      makeOrder(5, otherCustomerUser, 'CREATED', [2026, 9, 20]),
      customerUser,
    )
    expect(await screen.findByRole('heading', { name: 'Acceso denegado' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/403')
  })

  it('accepts and shows a success message', async () => {
    const order = makeOrder(5, customerUser, 'CREATED', [2026, 9, 20])
    vi.mocked(ordersService.changeStatus).mockResolvedValue({ ...order, status: 'ACCEPTED' })
    const user = userEvent.setup()
    renderDetail(order)

    await user.click(await screen.findByRole('button', { name: 'Aceptar' }))

    expect(ordersService.changeStatus).toHaveBeenCalledWith(order, 'ACCEPTED', operatorUser)
    expect(await screen.findByText('Pedido N° 5 actualizado a «Aceptado».')).toBeInTheDocument()
  })

  it('shows which products are short when accepting fails', async () => {
    const order = makeOrder(5, customerUser, 'CREATED', [2026, 9, 20])
    vi.mocked(ordersService.changeStatus).mockRejectedValue(
      new InsufficientStockError([
        { productId: 1, productName: 'Café en grano 1 kg', requested: 2, available: 1 },
      ]),
    )
    const user = userEvent.setup()
    renderDetail(order)

    await user.click(await screen.findByRole('button', { name: 'Aceptar' }))

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('No hay stock suficiente. El pedido sigue en «Creado».')
    expect(alert).toHaveTextContent('Café en grano 1 kg: pedido 2, disponible 1')
  })

  it('asks for confirmation before cancelling', async () => {
    const order = makeOrder(5, customerUser, 'ACCEPTED', [2026, 9, 20])
    vi.mocked(ordersService.changeStatus).mockResolvedValue({ ...order, status: 'CANCELLED' })
    const user = userEvent.setup()
    renderDetail(order)

    await user.click(await screen.findByRole('button', { name: 'Cancelar pedido' }))
    const dialog = await screen.findByRole('dialog', { name: 'Cancelar pedido' })
    expect(dialog).toHaveTextContent('Esta acción no se puede deshacer')
    expect(ordersService.changeStatus).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Cancelar pedido' }))
    expect(ordersService.changeStatus).toHaveBeenCalledWith(order, 'CANCELLED', operatorUser)
  })

  it('shows a not-found message for a missing order', async () => {
    vi.mocked(ordersService.getById).mockRejectedValue(
      Object.assign(new Error('404'), { isAxiosError: true, response: { status: 404 } }),
    )
    renderWithProviders({ user: operatorUser, initialPath: '/orders/99', routes })

    expect(await screen.findByText('El pedido N° 99 no existe.')).toBeInTheDocument()
  })

  it('shows the current product photo next to each item', async () => {
    renderDetail(makeOrder(5, customerUser, 'CREATED', [2026, 9, 20]))

    const items = await screen.findByRole('table', { name: 'Ítems del pedido' })
    expect(await within(items).findByRole('img', { name: 'Café en grano 1 kg' })).toHaveAttribute(
      'src',
      '/images/products/caf-001.jpg',
    )
  })

  it('still shows the order with placeholders when products fail to load', async () => {
    const order = makeOrder(5, customerUser, 'CREATED', [2026, 9, 20])
    vi.mocked(ordersService.getById).mockResolvedValue(order)
    vi.mocked(catalogService.list).mockRejectedValue(new Error('Sin conexión'))
    renderWithProviders({ user: operatorUser, initialPath: '/orders/5', routes })

    const items = await screen.findByRole('table', { name: 'Ítems del pedido' })
    expect(
      within(items).getByRole('img', { name: 'Café en grano 1 kg (sin foto)' }),
    ).toBeInTheDocument()
    expect(screen.getByLabelText('Total del pedido')).toHaveTextContent('$31.980')
  })

  it('uses the palette yellow for the back arrow', async () => {
    const order = makeOrder(5, customerUser, 'CREATED', [2026, 9, 20])
    order.status = 'ACCEPTED'
    order.history.push({ status: 'ACCEPTED', at: '2026-09-21T15:00:00.000Z', by: 'Carlos Muñoz' })
    renderDetail(order)

    await screen.findByRole('heading', { name: 'Pedido N° 5' })
    const back = screen.getByRole('link', { name: 'Volver a pedidos' })
    expect(back.querySelector('svg')).toHaveClass('MuiSvgIcon-colorSecondary')

  })
})

describe('OrderDetailPage with backend IDs', () => {

  it('shows a UUID order without history and explains the backend limits', async () => {
    const order = { ...makeOrder(5, customerUser, 'CREATED', [2026, 9, 20]), id: 'uuid-order' }
    vi.mocked(catalogService.list).mockResolvedValue([])
    vi.mocked(ordersService.getById).mockResolvedValue(order)
    renderWithProviders({ user: operatorUser, initialPath: '/orders/uuid-order', routes })

    expect(await screen.findByRole('heading', { name: 'Pedido N° uuid-order' })).toBeInTheDocument()
    expect(ordersService.getById).toHaveBeenCalledWith('uuid-order')
    expect(screen.queryByRole('list', { name: 'Historial de estados' })).not.toBeInTheDocument()
    expect(screen.queryByText(/Última actualización/)).not.toBeInTheDocument()
    expect(await screen.findByRole('button', { name: 'Aceptar' })).toBeInTheDocument()
  })
})

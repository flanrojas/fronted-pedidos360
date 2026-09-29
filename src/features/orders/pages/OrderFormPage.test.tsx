import { screen, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import type { RouteObject } from 'react-router'
import { catalogService } from '@/features/catalog/services/catalogService'
import { sampleProducts } from '@/test/fixtures/products'
import { renderWithProviders } from '@/test/renderWithProviders'
import { customerUser, operatorUser } from '@/test/testUsers'
import { ordersService } from '../services/ordersService'
import { OrderFormPage } from './OrderFormPage'

vi.mock('@/features/catalog/services/catalogService')
vi.mock('../services/ordersService')

const routes: RouteObject[] = [
  { path: '/orders', element: <h1>Listado de pedidos</h1> },
  { path: '/orders/new', element: <OrderFormPage /> },
]

function renderForm(user = customerUser) {
  return renderWithProviders({ user, initialPath: '/orders/new', routes })
}

async function addProduct(user: UserEvent, name: string, quantity: string) {
  await user.click(await screen.findByRole('combobox', { name: 'Producto' }))
  await user.click(await screen.findByRole('option', { name: new RegExp(name) }))
  const qty = screen.getByRole('spinbutton', { name: 'Cantidad' })
  await user.clear(qty)
  await user.type(qty, quantity)
  await user.click(screen.getByRole('button', { name: 'Agregar' }))
}

describe('OrderFormPage', () => {
  beforeEach(() => {
    vi.mocked(catalogService.list).mockResolvedValue(sampleProducts)
    vi.mocked(ordersService.create).mockImplementation(async (order) => ({ id: 7, ...order }))
  })

  it('does not allow submitting an order without items', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(await screen.findByRole('button', { name: 'Crear pedido' }))

    expect(await screen.findByText('Agrega al menos un producto al pedido')).toBeInTheDocument()
    expect(ordersService.create).not.toHaveBeenCalled()
  })

  it('only offers active products', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(await screen.findByRole('combobox', { name: 'Producto' }))
    const options = await screen.findAllByRole('option')
    expect(options.map((o) => o.textContent)).toEqual([
      expect.stringContaining('Café en grano'),
      expect.stringContaining('Leche de almendras'),
    ])
  })

  it('adds quantity to the existing line when a product is repeated, with a live total', async () => {
    const user = userEvent.setup()
    renderForm()

    await addProduct(user, 'Café en grano', '1')
    await addProduct(user, 'Café en grano', '2')

    const table = screen.getByRole('table', { name: 'Productos del pedido' })
    expect(within(table).getAllByRole('row')).toHaveLength(3)
    expect(within(table).getByLabelText('Cantidad de Café en grano 1 kg')).toHaveValue(3)
    expect(screen.getByLabelText('Total del pedido')).toHaveTextContent('$47.970')
  })

  it('warns when the quantity exceeds current stock', async () => {
    const user = userEvent.setup()
    renderForm()

    await addProduct(user, 'Leche de almendras', '1')

    expect(screen.getByText(/Supera el stock actual \(0\)/)).toBeInTheDocument()
  })

  it('CUSTOMER creates a CREATED order for themselves without touching stock', async () => {
    const user = userEvent.setup()
    const { router } = renderForm(customerUser)

    expect(await screen.findByText('Valentina Rojas')).toBeInTheDocument()
    expect(screen.queryByRole('combobox', { name: 'Cliente' })).not.toBeInTheDocument()

    await addProduct(user, 'Café en grano', '2')
    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    await screen.findByRole('heading', { name: 'Listado de pedidos' })
    expect(router.state.location.pathname).toBe('/orders')
    const [order] = vi.mocked(ordersService.create).mock.calls[0]
    expect(order).toMatchObject({
      customerId: 3,
      customerName: 'Valentina Rojas',
      items: [{ productId: 1, productName: 'Café en grano 1 kg', quantity: 2, unitPrice: 15990 }],
      total: 31980,
      status: 'CREATED',
      history: [{ status: 'CREATED', by: 'Valentina Rojas' }],
    })
    expect(order.createdAt).toBe(order.updatedAt)
    expect(catalogService.adjustStock).not.toHaveBeenCalled()
  })

  it('OPERATOR must enter a customer ID', async () => {
    const user = userEvent.setup()
    renderForm(operatorUser)

    await addProduct(user, 'Café en grano', '1')
    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))
    expect(await screen.findByText('Ingresa un ID de cliente válido')).toBeInTheDocument()
    expect(ordersService.create).not.toHaveBeenCalled()

    await user.type(screen.getByRole('textbox', { name: 'ID del cliente' }), 'cliente-004')
    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    await screen.findByRole('heading', { name: 'Listado de pedidos' })
    expect(vi.mocked(ordersService.create).mock.calls[0][0]).toMatchObject({
      customerId: 'cliente-004',
      customerName: 'cliente-004',
      history: [{ status: 'CREATED', by: 'Carlos Muñoz' }],
    })
  })

  it('notifies success after creating the order', async () => {
    const user = userEvent.setup()
    renderForm(customerUser)

    await addProduct(user, 'Café en grano', '1')
    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    expect(await screen.findByText('Pedido N° 7 creado para Valentina Rojas.')).toBeInTheDocument()
  })

  it('shows product photos in the picker, the selected product and the order lines', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(await screen.findByRole('combobox', { name: 'Producto' }))
    const cafeOption = await screen.findByRole('option', { name: /Café en grano/ })
    expect(within(cafeOption).getByRole('img', { name: 'Café en grano 1 kg' })).toHaveAttribute(
      'src',
      '/images/products/caf-001.jpg',
    )
    const lecheOption = screen.getByRole('option', { name: /Leche de almendras/ })
    expect(
      within(lecheOption).getByRole('img', { name: 'Leche de almendras 1 L (sin foto)' }),
    ).toBeInTheDocument()

    await user.click(cafeOption)
    const picker = screen
      .getByRole('combobox', { name: 'Producto' })
      .closest('.MuiAutocomplete-root')
    expect(
      within(picker as HTMLElement).getByRole('img', { name: 'Café en grano 1 kg' }),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Agregar' }))
    const table = screen.getByRole('table', { name: 'Productos del pedido' })
    expect(within(table).getByRole('img', { name: 'Café en grano 1 kg' })).toHaveAttribute(
      'src',
      '/images/products/caf-001.jpg',
    )
  })
})

describe('OrderFormPage with backend IDs', () => {
  beforeEach(() => {
    vi.mocked(catalogService.list).mockResolvedValue(sampleProducts)
    vi.mocked(ordersService.create).mockImplementation(async (order) => ({
      id: 'uuid-new-order',
      ...order,
    }))
  })

  it('returns to the backend order list after creating an order', async () => {
    const user = userEvent.setup()
    const { router } = renderWithProviders({
      user: customerUser,
      initialPath: '/orders/new',
      routes: [...routes, { path: '/orders/:id', element: <h1>Detalle</h1> }],
    })

    await addProduct(user, 'Café en grano', '1')
    await user.click(screen.getByRole('button', { name: 'Crear pedido' }))

    await screen.findByRole('heading', { name: 'Listado de pedidos' })
    expect(router.state.location.pathname).toBe('/orders')
  })
})

import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router'
import { sampleProducts } from '@/test/fixtures/products'
import { renderWithProviders } from '@/test/renderWithProviders'
import { adminUser, operatorUser } from '@/test/testUsers'
import { catalogService } from '../services/catalogService'
import { CatalogPage } from './CatalogPage'

vi.mock('../services/catalogService')

const routes: RouteObject[] = [{ path: '/catalog', element: <CatalogPage /> }]

function renderCatalog(user = adminUser) {
  return renderWithProviders({ user, initialPath: '/catalog', routes })
}

describe('CatalogPage', () => {
  beforeEach(() => {
    vi.mocked(catalogService.list).mockResolvedValue(sampleProducts)
  })

  it('shows products with CLP price and status chips', async () => {
    renderCatalog()

    const cafe = await screen.findByRole('article', { name: 'Café en grano 1 kg' })
    expect(within(cafe).getByText('$15.990')).toBeInTheDocument()
    expect(
      within(screen.getByRole('article', { name: 'Leche de almendras 1 L' })).getByText(
        'Sin stock',
      ),
    ).toBeInTheDocument()
    expect(
      within(screen.getByRole('article', { name: 'Cápsulas compatibles' })).getByText('Inactivo'),
    ).toBeInTheDocument()
  })

  it('ADMIN sees create, edit, adjust stock and activate/deactivate actions', async () => {
    renderCatalog(adminUser)

    await screen.findByRole('article', { name: 'Café en grano 1 kg' })
    expect(screen.getByRole('link', { name: 'Nuevo producto' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar Café en grano 1 kg' })).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Ajustar stock de Café en grano 1 kg' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Desactivar Café en grano 1 kg' }),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Activar Cápsulas compatibles' })).toBeInTheDocument()
  })

  it('OPERATOR sees the catalog read-only', async () => {
    renderCatalog(operatorUser)

    await screen.findByRole('article', { name: 'Café en grano 1 kg' })
    expect(screen.queryByRole('link', { name: 'Nuevo producto' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^Editar/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Ajustar stock/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^(Desactivar|Activar)/ })).not.toBeInTheDocument()
  })

  it('filters by search text and status', async () => {
    const user = userEvent.setup()
    renderCatalog()
    await screen.findByRole('article', { name: 'Café en grano 1 kg' })

    await user.type(screen.getByLabelText('Buscar por nombre o SKU'), 'lec-')
    expect(screen.getAllByRole('article')).toHaveLength(1)

    await user.clear(screen.getByLabelText('Buscar por nombre o SKU'))
    await user.click(screen.getByRole('combobox', { name: 'Estado' }))
    await user.click(await screen.findByRole('option', { name: 'Inactivos' }))
    expect(screen.getAllByRole('article').map((a) => a.getAttribute('aria-label'))).toEqual([
      'Cápsulas compatibles',
    ])
  })

  it('shows an empty state when nothing matches', async () => {
    const user = userEvent.setup()
    renderCatalog()
    await screen.findByRole('article', { name: 'Café en grano 1 kg' })

    await user.type(screen.getByLabelText('Buscar por nombre o SKU'), 'zzz')
    expect(screen.getByText('No hay productos que coincidan')).toBeInTheDocument()
  })

  it('switches to list view', async () => {
    const user = userEvent.setup()
    renderCatalog()
    await screen.findByRole('article', { name: 'Café en grano 1 kg' })

    await user.click(screen.getByRole('button', { name: 'Vista de lista' }))
    const table = screen.getByRole('table', { name: 'Listado de productos' })
    expect(within(table).getAllByRole('row')).toHaveLength(sampleProducts.length + 1)
  })

  it('adjusts stock without allowing it to go negative', async () => {
    vi.mocked(catalogService.updateStock).mockResolvedValue({ ...sampleProducts[0], stock: 30 })
    const user = userEvent.setup()
    renderCatalog()

    await user.click(
      await screen.findByRole('button', { name: 'Ajustar stock de Café en grano 1 kg' }),
    )
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Restar' }))
    await user.type(within(dialog).getByLabelText(/Cantidad/), '41')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
    expect(await within(dialog).findByText(/El stock no puede quedar negativo/)).toBeInTheDocument()
    expect(catalogService.updateStock).not.toHaveBeenCalled()

    await user.clear(within(dialog).getByLabelText(/Cantidad/))
    await user.type(within(dialog).getByLabelText(/Cantidad/), '10')
    expect(within(dialog).getByText('30')).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))

    expect(catalogService.updateStock).toHaveBeenCalledWith(1, 30)
  })

  it('asks for confirmation before deactivating', async () => {
    vi.mocked(catalogService.setActive).mockResolvedValue({ ...sampleProducts[0], active: false })
    const user = userEvent.setup()
    renderCatalog()

    await user.click(await screen.findByRole('button', { name: 'Desactivar Café en grano 1 kg' }))
    const dialog = await screen.findByRole('dialog', { name: 'Desactivar producto' })
    expect(catalogService.setActive).not.toHaveBeenCalled()

    await user.click(within(dialog).getByRole('button', { name: 'Desactivar' }))
    expect(catalogService.setActive).toHaveBeenCalledWith(1, false)
  })

  it('shows an error with retry when loading fails', async () => {
    vi.mocked(catalogService.list).mockRejectedValue(new Error('boom'))
    renderCatalog()

    expect(await screen.findByText(/No se pudo cargar el catálogo/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('notifies after adjusting stock and after a failed deactivation', async () => {
    vi.mocked(catalogService.updateStock).mockResolvedValue({ ...sampleProducts[0], stock: 45 })
    vi.mocked(catalogService.setActive).mockRejectedValue(new Error('Sin conexión'))
    const user = userEvent.setup()
    renderCatalog()

    await user.click(
      await screen.findByRole('button', { name: 'Ajustar stock de Café en grano 1 kg' }),
    )
    const dialog = await screen.findByRole('dialog')
    await user.type(within(dialog).getByLabelText(/Cantidad/), '5')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
    expect(
      await screen.findByText('Stock de «Café en grano 1 kg» actualizado a 45.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Desactivar Café en grano 1 kg' }))
    const confirm = await screen.findByRole('dialog', { name: 'Desactivar producto' })
    await user.click(within(confirm).getByRole('button', { name: 'Desactivar' }))
    expect(
      await screen.findByText('No se pudo desactivar el producto. Sin conexión'),
    ).toBeInTheDocument()
  })

  it('shows the product photo, or a placeholder when it has none', async () => {
    renderCatalog()

    const cafe = await screen.findByRole('article', { name: 'Café en grano 1 kg' })
    expect(within(cafe).getByRole('img', { name: 'Café en grano 1 kg' })).toHaveAttribute(
      'src',
      '/images/products/caf-001.jpg',
    )
    const leche = screen.getByRole('article', { name: 'Leche de almendras 1 L' })
    expect(
      within(leche).getByRole('img', { name: 'Leche de almendras 1 L (sin foto)' }),
    ).toBeInTheDocument()
  })

  it('uses the palette orange (secondary) for action icons in cards and in the list', async () => {
    const user = userEvent.setup()
    renderCatalog()
    const names = [
      'Editar Café en grano 1 kg',
      'Ajustar stock de Café en grano 1 kg',
      'Desactivar Café en grano 1 kg',
      'Activar Cápsulas compatibles',
    ]
    const actions = () =>
      names.map(
        (name) => screen.queryByRole('link', { name }) ?? screen.getByRole('button', { name }),
      )

    await screen.findByRole('article', { name: 'Café en grano 1 kg' })
    for (const action of actions()) expect(action).toHaveClass('MuiIconButton-colorSecondary')

    await user.click(screen.getByRole('button', { name: 'Vista de lista' }))
    screen.getByRole('table', { name: 'Listado de productos' })
    for (const action of actions()) expect(action).toHaveClass('MuiIconButton-colorSecondary')
  })
})

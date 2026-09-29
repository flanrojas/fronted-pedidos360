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

  it('shows products with prices, stock and photos', async () => {
    renderCatalog()
    const cafe = await screen.findByRole('article', { name: 'Café en grano 1 kg' })
    expect(within(cafe).getByText('$15.990')).toBeInTheDocument()
    expect(within(cafe).getByRole('img', { name: 'Café en grano 1 kg' })).toHaveAttribute('src', '/images/products/caf-001.jpg')
    expect(within(screen.getByRole('article', { name: 'Leche de almendras 1 L' })).getByText('Sin stock')).toBeInTheDocument()
  })

  it('shows supported actions to ADMIN and read-only catalog to OPERATOR', async () => {
    renderCatalog(adminUser)
    await screen.findByRole('article', { name: 'Café en grano 1 kg' })
    expect(screen.getByRole('link', { name: 'Nuevo producto' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Editar Café en grano 1 kg' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ajustar stock de Café en grano 1 kg' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^(Desactivar|Activar)/ })).not.toBeInTheDocument()
  })

  it('hides editing actions for OPERATOR', async () => {
    renderCatalog(operatorUser)
    await screen.findByRole('article', { name: 'Café en grano 1 kg' })
    expect(screen.queryByRole('link', { name: 'Nuevo producto' })).not.toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /^Editar/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^Ajustar stock/ })).not.toBeInTheDocument()
  })

  it('filters by product name and shows an empty state', async () => {
    const user = userEvent.setup()
    renderCatalog()
    await screen.findByRole('article', { name: 'Café en grano 1 kg' })
    const search = screen.getByLabelText('Buscar por nombre')
    await user.type(search, 'Leche')
    expect(screen.getAllByRole('article')).toHaveLength(1)
    await user.clear(search)
    await user.type(search, 'zzz')
    expect(screen.getByText('No hay productos que coincidan')).toBeInTheDocument()
  })

  it('switches to list view', async () => {
    const user = userEvent.setup()
    renderCatalog()
    await screen.findByRole('article', { name: 'Café en grano 1 kg' })
    await user.click(screen.getByRole('button', { name: 'Vista de lista' }))
    expect(within(screen.getByRole('table', { name: 'Listado de productos' })).getAllByRole('row')).toHaveLength(sampleProducts.length + 1)
  })

  it('sends stock variation and reports errors', async () => {
    vi.mocked(catalogService.adjustStock).mockResolvedValue({ ...sampleProducts[0], stock: 30 })
    const user = userEvent.setup()
    renderCatalog()
    await user.click(await screen.findByRole('button', { name: 'Ajustar stock de Café en grano 1 kg' }))
    const dialog = await screen.findByRole('dialog')
    await user.click(within(dialog).getByRole('button', { name: 'Restar' }))
    await user.type(within(dialog).getByLabelText(/Cantidad/), '41')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
    expect(await within(dialog).findByText(/El stock no puede quedar negativo/)).toBeInTheDocument()
    expect(catalogService.adjustStock).not.toHaveBeenCalled()
    await user.clear(within(dialog).getByLabelText(/Cantidad/))
    await user.type(within(dialog).getByLabelText(/Cantidad/), '10')
    await user.click(within(dialog).getByRole('button', { name: 'Guardar' }))
    expect(catalogService.adjustStock).toHaveBeenCalledWith(sampleProducts[0], -10)
  })

  it('shows a retry option after a catalog error', async () => {
    vi.mocked(catalogService.list).mockRejectedValue(new Error('boom'))
    renderCatalog()
    expect(await screen.findByText(/No se pudo cargar el catálogo/)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })
})

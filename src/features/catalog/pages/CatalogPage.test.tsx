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

  describe('deleting a product', () => {
    const cafe = sampleProducts[0]
    const deleteButton = (name = cafe.name) => ({ name: `Eliminar ${name}` })

    it('only ADMIN sees the delete action, in cards and in the list', async () => {
      const user = userEvent.setup()
      const { unmount } = renderCatalog(adminUser)
      expect(await screen.findByRole('button', deleteButton())).toBeInTheDocument()
      await user.click(screen.getByRole('button', { name: 'Vista de lista' }))
      const table = screen.getByRole('table', { name: 'Listado de productos' })
      expect(within(table).getByRole('button', deleteButton())).toBeInTheDocument()
      unmount()

      renderCatalog(operatorUser)
      await screen.findByRole('article', { name: cafe.name })
      expect(screen.queryByRole('button', { name: /^Eliminar/ })).not.toBeInTheDocument()
    })

    it('asks for confirmation and deletes on confirm', async () => {
      vi.mocked(catalogService.remove).mockResolvedValue()
      const user = userEvent.setup()
      renderCatalog(adminUser)

      await user.click(await screen.findByRole('button', deleteButton()))
      const dialog = await screen.findByRole('dialog', { name: 'Eliminar producto' })
      expect(dialog).toHaveTextContent('Esta acción no se puede deshacer')
      expect(catalogService.remove).not.toHaveBeenCalled()

      await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))
      expect(catalogService.remove).toHaveBeenCalledWith(cafe.id)
      expect(await screen.findByText(`«${cafe.name}» eliminado del catálogo.`)).toBeInTheDocument()
    })

    it('does nothing when cancelled', async () => {
      const user = userEvent.setup()
      renderCatalog(adminUser)

      await user.click(await screen.findByRole('button', deleteButton()))
      const dialog = await screen.findByRole('dialog', { name: 'Eliminar producto' })
      await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))

      expect(catalogService.remove).not.toHaveBeenCalled()
    })

    it('shows the backend error (e.g. 403) and keeps the dialog open to retry', async () => {
      vi.mocked(catalogService.remove).mockRejectedValue(new Error('Acceso denegado (403)'))
      const user = userEvent.setup()
      renderCatalog(adminUser)

      await user.click(await screen.findByRole('button', deleteButton()))
      const dialog = await screen.findByRole('dialog', { name: 'Eliminar producto' })
      await user.click(within(dialog).getByRole('button', { name: 'Eliminar' }))

      expect(
        await screen.findByText('No se pudo eliminar el producto. Acceso denegado (403)'),
      ).toBeInTheDocument()
      expect(screen.getByRole('dialog', { name: 'Eliminar producto' })).toBeInTheDocument()
    })
  })
})

import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router'
import { sampleProducts } from '@/test/fixtures/products'
import { renderWithProviders } from '@/test/renderWithProviders'
import { adminUser } from '@/test/testUsers'
import { catalogService } from '../services/catalogService'
import { ProductFormPage } from './ProductFormPage'

vi.mock('../services/catalogService')

const routes: RouteObject[] = [
  { path: '/catalog', element: <h1>Listado del catálogo</h1> },
  { path: '/catalog/new', element: <ProductFormPage /> },
  { path: '/catalog/:id/edit', element: <ProductFormPage /> },
]

function renderForm(path = '/catalog/new') {
  return renderWithProviders({ user: adminUser, initialPath: path, routes })
}

describe('ProductFormPage', () => {
  beforeEach(() => {
    vi.mocked(catalogService.list).mockResolvedValue(sampleProducts)
  })

  it('requires name and price without showing unsupported fields', async () => {
    const user = userEvent.setup()
    renderForm()
    await user.click(await screen.findByRole('button', { name: 'Crear producto' }))
    expect(await screen.findByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument()
    expect(screen.getByText('El precio es obligatorio')).toBeInTheDocument()
    expect(screen.queryByLabelText(/SKU/)).not.toBeInTheDocument()
    expect(screen.queryByText('Foto del producto (opcional)')).not.toBeInTheDocument()
    expect(catalogService.create).not.toHaveBeenCalled()
  })

  it('creates a product and returns to the catalog', async () => {
    vi.mocked(catalogService.create).mockImplementation(async (product) => ({ id: 'uuid-1', ...product }))
    const user = userEvent.setup()
    const { router } = renderForm()
    await user.type(await screen.findByLabelText(/Nombre/), 'Producto nuevo')
    await user.type(screen.getByLabelText(/Precio/), '1500')
    await user.click(screen.getByRole('button', { name: 'Crear producto' }))
    await screen.findByRole('heading', { name: 'Listado del catálogo' })
    expect(router.state.location.pathname).toBe('/catalog')
    expect(catalogService.create).toHaveBeenCalledWith(expect.objectContaining({ name: 'Producto nuevo', price: 1500, stock: 0 }))
  })

  it('edits a product without changing stock', async () => {
    vi.mocked(catalogService.getById).mockResolvedValue(sampleProducts[0])
    vi.mocked(catalogService.update).mockResolvedValue(sampleProducts[0])
    const user = userEvent.setup()
    renderForm('/catalog/1/edit')
    const name = await screen.findByLabelText(/Nombre/)
    expect(screen.getByLabelText(/Stock/)).toHaveAttribute('readonly')
    await user.clear(name)
    await user.type(name, 'Café molido')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))
    await screen.findByRole('heading', { name: 'Listado del catálogo' })
    expect(catalogService.update).toHaveBeenCalledWith(1, expect.objectContaining({ name: 'Café molido', price: 15990 }))
  })

  it('shows an error if creating the product fails', async () => {
    vi.mocked(catalogService.create).mockRejectedValue(new Error('Servidor caído'))
    const user = userEvent.setup()
    const { router } = renderForm()
    await user.type(await screen.findByLabelText(/Nombre/), 'Producto nuevo')
    await user.type(screen.getByLabelText(/Precio/), '1000')
    await user.click(screen.getByRole('button', { name: 'Crear producto' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo crear el producto. Servidor caído')
    expect(router.state.location.pathname).toBe('/catalog/new')
  })
})

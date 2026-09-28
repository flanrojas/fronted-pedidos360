import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { RouteObject } from 'react-router'
import { sampleProducts } from '@/test/fixtures/products'
import { renderWithProviders } from '@/test/renderWithProviders'
import { adminUser } from '@/test/testUsers'
import { resizeImageFile } from '@/shared/utils/resizeImage'
import { catalogService } from '../services/catalogService'
import { ProductFormPage } from './ProductFormPage'

vi.mock('../services/catalogService')
vi.mock('@/shared/utils/resizeImage', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/utils/resizeImage')>()),
  resizeImageFile: vi.fn(),
}))

const RESIZED = 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='

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

  it('shows validation errors under each field when submitted empty', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.click(await screen.findByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByText('El SKU es obligatorio')).toBeInTheDocument()
    expect(screen.getByText('El nombre debe tener al menos 3 caracteres')).toBeInTheDocument()
    expect(screen.getByText('El precio es obligatorio')).toBeInTheDocument()
    expect(catalogService.create).not.toHaveBeenCalled()
  })

  it('rejects a SKU that already exists', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(await screen.findByLabelText(/SKU/), 'caf-001')
    await user.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByText('Ya existe un producto con este SKU')).toBeInTheDocument()
  })

  it('creates an active product and returns to the catalog', async () => {
    vi.mocked(catalogService.create).mockImplementation(async (p) => ({ id: 99, ...p }))
    const user = userEvent.setup()
    const { router } = renderForm()

    await user.type(await screen.findByLabelText(/SKU/), 'NEW-100')
    await user.type(screen.getByLabelText(/Nombre/), 'Producto nuevo')
    await user.type(screen.getByLabelText(/Precio/), '2990')
    await user.clear(screen.getByLabelText(/Stock/))
    await user.type(screen.getByLabelText(/Stock/), '15')
    await user.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByRole('heading', { name: 'Listado del catálogo' })).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/catalog')
    expect(catalogService.create).toHaveBeenCalledWith({
      sku: 'NEW-100',
      name: 'Producto nuevo',
      description: '',
      price: 2990,
      stock: 15,
      active: true,
      imageUrl: '',
    })
  })

  it('edits without touching stock or active status', async () => {
    vi.mocked(catalogService.getById).mockResolvedValue(sampleProducts[0])
    vi.mocked(catalogService.update).mockResolvedValue(sampleProducts[0])
    const user = userEvent.setup()
    renderForm('/catalog/1/edit')

    const name = await screen.findByLabelText(/Nombre/)
    expect(name).toHaveValue('Café en grano 1 kg')
    expect(screen.getByLabelText(/Stock/)).toHaveAttribute('readonly')

    await user.clear(name)
    await user.type(name, 'Café molido 1 kg')
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await screen.findByRole('heading', { name: 'Listado del catálogo' })
    expect(catalogService.update).toHaveBeenCalledWith(1, {
      sku: 'CAF-001',
      name: 'Café molido 1 kg',
      description: 'Café de especialidad.',
      price: 15990,
      imageUrl: '/images/products/caf-001.jpg',
    })
  })

  it('notifies success after creating', async () => {
    vi.mocked(catalogService.create).mockImplementation(async (p) => ({ id: 99, ...p }))
    const user = userEvent.setup()
    renderForm()

    await user.type(await screen.findByLabelText(/SKU/), 'NEW-200')
    await user.type(screen.getByLabelText(/Nombre/), 'Producto nuevo')
    await user.type(screen.getByLabelText(/Precio/), '1000')
    await user.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByText('Producto «Producto nuevo» creado.')).toBeInTheDocument()
  })

  it('notifies the error and stays on the form when saving fails', async () => {
    vi.mocked(catalogService.create).mockRejectedValue(new Error('Servidor caído'))
    const user = userEvent.setup()
    const { router } = renderForm()

    await user.type(await screen.findByLabelText(/SKU/), 'NEW-300')
    await user.type(screen.getByLabelText(/Nombre/), 'Producto nuevo')
    await user.type(screen.getByLabelText(/Precio/), '1000')
    await user.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo crear el producto. Servidor caído',
    )
    expect(router.state.location.pathname).toBe('/catalog/new')
  })

  it('uploads a photo from the computer, previews it and saves it resized', async () => {
    vi.mocked(resizeImageFile).mockResolvedValue(RESIZED)
    vi.mocked(catalogService.create).mockImplementation(async (p) => ({ id: 99, ...p }))
    const user = userEvent.setup()
    renderForm()

    await user.type(await screen.findByLabelText(/SKU/), 'NEW-400')
    await user.type(screen.getByLabelText(/Nombre/), 'Producto con foto')
    await user.type(screen.getByLabelText(/Precio/), '1000')
    const file = new File(['img'], 'foto.png', { type: 'image/png' })
    await user.upload(screen.getByTestId('product-image-input'), file)

    expect(resizeImageFile).toHaveBeenCalledWith(file)
    expect(await screen.findByRole('img', { name: 'Producto con foto' })).toHaveAttribute(
      'src',
      RESIZED,
    )
    expect(screen.getByPlaceholderText('Imagen subida desde tu computador')).toHaveValue('')

    await user.click(screen.getByRole('button', { name: 'Crear producto' }))
    await screen.findByRole('heading', { name: 'Listado del catálogo' })
    expect(vi.mocked(catalogService.create).mock.calls[0][0].imageUrl).toBe(RESIZED)
  })

  it('shows the error when the uploaded file cannot be processed', async () => {
    vi.mocked(resizeImageFile).mockRejectedValue(
      new Error('Formato no soportado. Usa una imagen JPG, PNG o WebP.'),
    )
    const user = userEvent.setup({ applyAccept: false })
    renderForm()

    await user.upload(
      await screen.findByTestId('product-image-input'),
      new File(['gif'], 'a.gif', { type: 'image/gif' }),
    )
    expect(
      await screen.findByText('Formato no soportado. Usa una imagen JPG, PNG o WebP.'),
    ).toBeInTheDocument()
  })

  it('rejects an invalid image URL', async () => {
    const user = userEvent.setup()
    renderForm()

    await user.type(await screen.findByLabelText(/pega la URL/), 'no-es-una-url')
    await user.click(screen.getByRole('button', { name: 'Crear producto' }))

    expect(
      await screen.findByText(
        'Ingresa una URL válida (http/https) o sube una imagen JPG, PNG o WebP',
      ),
    ).toBeInTheDocument()
  })

  it('removes the photo of an existing product', async () => {
    vi.mocked(catalogService.getById).mockResolvedValue(sampleProducts[0])
    vi.mocked(catalogService.update).mockResolvedValue(sampleProducts[0])
    const user = userEvent.setup()
    renderForm('/catalog/1/edit')

    expect(await screen.findByRole('img', { name: 'Café en grano 1 kg' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Quitar foto' }))
    expect(screen.getByRole('img', { name: 'Café en grano 1 kg (sin foto)' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Guardar cambios' }))

    await screen.findByRole('heading', { name: 'Listado del catálogo' })
    expect(vi.mocked(catalogService.update).mock.calls[0][1].imageUrl).toBe('')
  })
})

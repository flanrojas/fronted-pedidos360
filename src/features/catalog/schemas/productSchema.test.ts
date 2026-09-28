import { createProductSchema, type ProductFormValues } from './productSchema'

const existing = [
  { id: 1, sku: 'CAF-001' },
  { id: 2, sku: 'TE-002' },
]

const valid: ProductFormValues = {
  sku: 'NEW-100',
  name: 'Producto nuevo',
  description: '',
  price: 1990,
  stock: 0,
  imageUrl: '',
}

function errorsFor(values: Partial<Record<keyof ProductFormValues, unknown>>, currentId?: number) {
  const result = createProductSchema(existing, currentId).safeParse({ ...valid, ...values })
  if (result.success) return {}
  return Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]))
}

describe('productSchema', () => {
  it('accepts a valid product', () => {
    expect(createProductSchema(existing).safeParse(valid).success).toBe(true)
  })

  it('trims text fields', () => {
    const result = createProductSchema(existing).parse({
      ...valid,
      sku: '  NEW-1 ',
      name: '  Té verde  ',
    })
    expect(result.sku).toBe('NEW-1')
    expect(result.name).toBe('Té verde')
  })

  describe('sku', () => {
    it('is required', () => {
      expect(errorsFor({ sku: '   ' }).sku).toBe('El SKU es obligatorio')
    })

    it('must be unique, ignoring case and spaces', () => {
      expect(errorsFor({ sku: 'caf-001' }).sku).toBe('Ya existe un producto con este SKU')
      expect(errorsFor({ sku: ' TE-002 ' }).sku).toBe('Ya existe un producto con este SKU')
    })

    it('allows keeping its own SKU when editing', () => {
      expect(errorsFor({ sku: 'CAF-001' }, 1).sku).toBeUndefined()
      expect(errorsFor({ sku: 'TE-002' }, 1).sku).toBe('Ya existe un producto con este SKU')
    })
  })

  describe('name', () => {
    it('needs at least 3 characters', () => {
      expect(errorsFor({ name: 'ab' }).name).toBe('El nombre debe tener al menos 3 caracteres')
      expect(errorsFor({ name: '  ab  ' }).name).toBe('El nombre debe tener al menos 3 caracteres')
      expect(errorsFor({ name: 'abc' }).name).toBeUndefined()
    })
  })

  describe('price', () => {
    it.each([
      [undefined, 'El precio es obligatorio'],
      [Number.NaN, 'El precio es obligatorio'],
      [0, 'El precio debe ser mayor a 0'],
      [-100, 'El precio debe ser mayor a 0'],
      [10.5, 'El precio debe ser un número entero'],
    ])('rejects %s', (price, message) => {
      expect(errorsFor({ price }).price).toBe(message)
    })

    it('accepts a positive integer', () => {
      expect(errorsFor({ price: 1 }).price).toBeUndefined()
    })
  })

  describe('stock', () => {
    it.each([
      [undefined, 'El stock es obligatorio'],
      [-1, 'El stock no puede ser negativo'],
      [2.5, 'El stock debe ser un número entero'],
    ])('rejects %s', (stock, message) => {
      expect(errorsFor({ stock }).stock).toBe(message)
    })

    it('accepts 0', () => {
      expect(errorsFor({ stock: 0 }).stock).toBeUndefined()
    })
  })

  describe('imageUrl', () => {
    it('is optional and accepts URLs, app paths and uploaded images', () => {
      expect(errorsFor({ imageUrl: '' }).imageUrl).toBeUndefined()
      expect(errorsFor({ imageUrl: 'https://example.com/a.jpg' }).imageUrl).toBeUndefined()
      expect(errorsFor({ imageUrl: '/images/products/caf-001.jpg' }).imageUrl).toBeUndefined()
      expect(errorsFor({ imageUrl: 'data:image/jpeg;base64,/9j/4A==' }).imageUrl).toBeUndefined()
    })

    it('rejects anything else', () => {
      expect(errorsFor({ imageUrl: 'foto.jpg' }).imageUrl).toBe(
        'Ingresa una URL válida (http/https) o sube una imagen JPG, PNG o WebP',
      )
    })
  })
})

import { fireEvent, render, screen } from '@testing-library/react'
import { ProductImage } from './ProductImage'

describe('ProductImage', () => {
  it('shows the photo with its alt text', () => {
    render(<ProductImage src="/images/products/caf-001.jpg" alt="Café en grano" />)
    expect(screen.getByRole('img', { name: 'Café en grano' })).toHaveAttribute(
      'src',
      '/images/products/caf-001.jpg',
    )
  })

  it('shows a placeholder when there is no photo', () => {
    render(<ProductImage src="" alt="Filtros" />)
    expect(screen.getByRole('img', { name: 'Filtros (sin foto)' })).toBeInTheDocument()
  })

  it('falls back to the placeholder when the photo fails to load', () => {
    render(<ProductImage src="https://example.com/rota.jpg" alt="Taza" />)
    fireEvent.error(screen.getByRole('img', { name: 'Taza' }))
    expect(screen.getByRole('img', { name: 'Taza (sin foto)' })).toBeInTheDocument()
  })

  it('tries again when the source changes after a failure', () => {
    const { rerender } = render(<ProductImage src="https://example.com/rota.jpg" alt="Taza" />)
    fireEvent.error(screen.getByRole('img', { name: 'Taza' }))
    rerender(<ProductImage src="/images/products/taz-006.jpg" alt="Taza" />)
    expect(screen.getByRole('img', { name: 'Taza' })).toHaveAttribute(
      'src',
      '/images/products/taz-006.jpg',
    )
  })
})

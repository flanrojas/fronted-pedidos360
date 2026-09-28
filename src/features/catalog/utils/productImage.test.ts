import { isValidImageUrl, MAX_IMAGE_DATA_URL_LENGTH } from './productImage'

describe('isValidImageUrl', () => {
  it.each([
    ['', 'no image'],
    ['https://example.com/cafe.jpg', 'https URL'],
    ['http://localhost:3001/img.png', 'http URL'],
    ['/images/products/caf-001.jpg', 'app path'],
    ['data:image/jpeg;base64,/9j/4AAQSkZJRg==', 'JPEG data URL'],
    ['data:image/png;base64,iVBORw0KGgo=', 'PNG data URL'],
    ['data:image/webp;base64,UklGRg==', 'WebP data URL'],
  ])('accepts %s (%s)', (value) => {
    expect(isValidImageUrl(value)).toBe(true)
  })

  it.each([
    ['hola', 'plain text'],
    ['ftp://example.com/a.jpg', 'non-http protocol'],
    ['javascript:alert(1)', 'javascript URL'],
    ['//evil.com/a.png', 'protocol-relative URL'],
    ['data:text/html;base64,PGgxPg==', 'non-image data URL'],
    ['data:image/svg+xml;base64,PHN2Zz4=', 'SVG data URL'],
    ['data:image/jpeg;base64,not base64!', 'malformed data URL'],
  ])('rejects %s (%s)', (value) => {
    expect(isValidImageUrl(value)).toBe(false)
  })

  it('rejects data URLs above the size limit', () => {
    const prefix = 'data:image/jpeg;base64,'
    const tooBig = prefix + 'A'.repeat(MAX_IMAGE_DATA_URL_LENGTH)
    expect(isValidImageUrl(tooBig)).toBe(false)
  })
})

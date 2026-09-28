/** Upper bound for images stored inline as data URLs (resizeImageFile targets 150k). */
export const MAX_IMAGE_DATA_URL_LENGTH = 200_000

const DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/

export function isDataImageUrl(value: string): boolean {
  return value.startsWith('data:')
}

/**
 * Accepted values for `Product.imageUrl`:
 * - empty string (no image)
 * - an http(s) URL
 * - a path served by the app, e.g. `/images/products/caf-001.jpg`
 * - a JPEG/PNG/WebP data URL produced by the upload, within the size limit
 */
export function isValidImageUrl(value: string): boolean {
  if (value === '') return true
  if (isDataImageUrl(value)) {
    return value.length <= MAX_IMAGE_DATA_URL_LENGTH && DATA_URL_PATTERN.test(value)
  }
  if (value.startsWith('/') && !value.startsWith('//')) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

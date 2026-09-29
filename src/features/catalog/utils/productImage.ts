export const MAX_IMAGE_DATA_URL_LENGTH = 200_000

const DATA_URL_PATTERN = /^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/

export function isDataImageUrl(value: string): boolean {
  return value.startsWith('data:')
}

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

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const

export const MAX_SOURCE_BYTES = 5 * 1024 * 1024

interface Size {
  width: number
  height: number
}

export function fitWithin({ width, height }: Size, max: number): Size {
  const longest = Math.max(width, height)
  if (longest <= max) return { width, height }
  const scale = max / longest
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('No se pudo leer la imagen. Prueba con otro archivo.'))
    }
    image.src = url
  })
}

interface ResizeOptions {
  maxSize?: number
  maxLength?: number
}

export async function resizeImageFile(
  file: File,
  { maxSize = 600, maxLength = 150_000 }: ResizeOptions = {},
): Promise<string> {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    throw new Error('Formato no soportado. Usa una imagen JPG, PNG o WebP.')
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('La imagen pesa más de 5 MB.')
  }

  const image = await loadImage(file)
  const { width, height } = fitWithin(
    { width: image.naturalWidth, height: image.naturalHeight },
    maxSize,
  )
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Tu navegador no permite procesar imágenes.')

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)
  context.drawImage(image, 0, 0, width, height)

  for (const quality of [0.85, 0.75, 0.65, 0.5, 0.4]) {
    const dataUrl = canvas.toDataURL('image/jpeg', quality)
    if (dataUrl.length <= maxLength) return dataUrl
  }
  throw new Error('No se pudo reducir la imagen lo suficiente. Prueba con una más simple.')
}

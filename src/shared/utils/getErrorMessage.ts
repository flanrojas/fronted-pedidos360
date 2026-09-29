import { isAxiosError } from 'axios'

function bodyMessage(data: unknown): string | undefined {
  if (typeof data !== 'object' || data === null) return undefined
  const { error, message } = data as { error?: unknown; message?: unknown }
  const text = typeof error === 'string' ? error : typeof message === 'string' ? message : ''
  return text.trim() || undefined
}

export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (isAxiosError(error)) {
    if (!error.response) {
      return 'No se pudo conectar con el backend. Revisa la URL y la conexión.'
    }
    const { status, data } = error.response
    const detail = bodyMessage(data)
    if (status === 404) return detail ?? 'El recurso solicitado no existe'
    return detail ? `${detail} (${status})` : `Error del servidor (${status})`
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

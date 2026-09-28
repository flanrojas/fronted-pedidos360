import { isAxiosError } from 'axios'

/** Converts an unknown error (Axios or domain) into a user-facing message in Spanish. */
export function getErrorMessage(error: unknown, fallback = 'Ocurrió un error inesperado'): string {
  if (isAxiosError(error)) {
    if (!error.response) return 'No se pudo conectar con el servidor. ¿Está corriendo el mock?'
    if (error.response.status === 404) return 'El recurso solicitado no existe'
    return `Error del servidor (${error.response.status})`
  }
  if (error instanceof Error && error.message) return error.message
  return fallback
}

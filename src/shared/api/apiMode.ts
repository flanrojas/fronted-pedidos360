export function backendBaseUrl(): string {
  if (import.meta.env.VITE_BACKEND_PROXY !== 'false') return ''
  return (import.meta.env.VITE_BACKEND_URL ?? '').replace(/\/+$/, '')
}

export function apiCapabilities() {
  return {
    catalog: { extendedFields: false, edit: true, toggleActive: false },
    orders: { list: true, history: false, stockOnStatusChange: false },
  } as const
}

export class UnsupportedByBackendError extends Error {
  constructor(operation: string) {
    super(`El backend todavía no permite: ${operation}.`)
    this.name = 'UnsupportedByBackendError'
  }
}

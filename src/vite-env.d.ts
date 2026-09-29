
interface ImportMetaEnv {
  readonly VITE_BACKEND_URL?: string
  readonly VITE_BACKEND_PROXY?: string
  readonly VITE_ENTRA_TENANT_ID?: string
  readonly VITE_ENTRA_CLIENT_ID?: string
  readonly VITE_ENTRA_API_SCOPE?: string
  readonly VITE_ENTRA_API_SCOPES?: string
  readonly VITE_ENTRA_REDIRECT_URI?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

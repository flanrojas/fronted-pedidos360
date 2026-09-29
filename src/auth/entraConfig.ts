import { PublicClientApplication, type Configuration } from '@azure/msal-browser'

export function missingEntraSettings(): string[] {
  const settings = {
    VITE_ENTRA_TENANT_ID: import.meta.env.VITE_ENTRA_TENANT_ID,
    VITE_ENTRA_CLIENT_ID: import.meta.env.VITE_ENTRA_CLIENT_ID,
    VITE_ENTRA_API_SCOPES: import.meta.env.VITE_ENTRA_API_SCOPES ?? import.meta.env.VITE_ENTRA_API_SCOPE,
    VITE_ENTRA_REDIRECT_URI: import.meta.env.VITE_ENTRA_REDIRECT_URI,
  }
  return Object.entries(settings)
    .filter(([, value]) => !value?.trim())
    .map(([name]) => name)
}

let instance: PublicClientApplication | null = null

export function getMsalInstance(): PublicClientApplication {
  if (instance) return instance
  const missing = missingEntraSettings()
  if (missing.length) throw new Error(`Faltan variables de Microsoft Entra: ${missing.join(', ')}`)

  const config: Configuration = {
    auth: {
      clientId: import.meta.env.VITE_ENTRA_CLIENT_ID!,
      authority: `https://login.microsoftonline.com/${import.meta.env.VITE_ENTRA_TENANT_ID}`,
      redirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI!,
      postLogoutRedirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI!,
    },
    cache: { cacheLocation: 'sessionStorage' },
  }
  instance = new PublicClientApplication(config)
  return instance
}

export function apiScopes(): string[] {
  const configured = import.meta.env.VITE_ENTRA_API_SCOPES ?? import.meta.env.VITE_ENTRA_API_SCOPE ?? ''
  return configured.split(',').map((scope) => scope.trim()).filter(Boolean)
}

export async function getApiAccessToken(): Promise<string> {
  const msal = getMsalInstance()
  const account = msal.getActiveAccount() ?? msal.getAllAccounts()[0]
  if (!account) throw new Error('Inicia sesión con Microsoft para acceder a la API.')
  const result = await msal.acquireTokenSilent({ account, scopes: apiScopes() })
  return result.accessToken
}

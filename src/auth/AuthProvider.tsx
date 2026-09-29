import { InteractionStatus } from '@azure/msal-browser'
import { MsalProvider, useMsal } from '@azure/msal-react'
import { Alert, Box } from '@mui/material'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { apiScopes, getMsalInstance, missingEntraSettings } from './entraConfig'
import { userFromToken } from './entraUser'
import type { User } from './types'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const missing = missingEntraSettings()
  if (missing.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          Faltan variables de Microsoft Entra en .env: {missing.join(', ')}.
        </Alert>
      </Box>
    )
  }

  return (
    <MsalProvider instance={getMsalInstance()}>
      <EntraAuthProvider>{children}</EntraAuthProvider>
    </MsalProvider>
  )
}

function EntraAuthProvider({ children }: AuthProviderProps) {
  const { instance, accounts, inProgress } = useMsal()
  const account = instance.getActiveAccount() ?? accounts[0]
  const accountId = account?.homeAccountId
  const [resolved, setResolved] = useState<{
    accountId: string
    user: User | null
    error: string | null
  } | null>(null)
  const current = resolved?.accountId === accountId ? resolved : null
  const currentUser = current?.user ?? null
  const authError = current?.error ?? null

  useEffect(() => {
    if (inProgress !== InteractionStatus.None || !accountId) return

    const selectedAccount = instance.getActiveAccount() ?? instance.getAllAccounts()[0]
    if (!selectedAccount) return
    instance.setActiveAccount(selectedAccount)
    let active = true
    void instance.acquireTokenSilent({ account: selectedAccount, scopes: apiScopes() })
      .then((result) => {
        if (!active) return
        const user = userFromToken(result)
        setResolved({
          accountId,
          user,
          error: user ? null : 'Tu cuenta no tiene un rol válido o un identificador en el token de la API.',
        })
      })
      .catch((error: unknown) => {
        if (!active) return
        setResolved({
          accountId,
          user: null,
          error: error instanceof Error ? error.message : 'No se pudo obtener acceso a la API.',
        })
      })
    return () => { active = false }
  }, [instance, accountId, inProgress])

  const loginWithMicrosoft = useCallback(async () => {
    await instance.loginRedirect({ scopes: apiScopes() })
  }, [instance])

  const logout = useCallback(() => {
    setResolved(null)
    void instance.logoutRedirect({ account, postLogoutRedirectUri: import.meta.env.VITE_ENTRA_REDIRECT_URI })
  }, [instance, account])

  const value = useMemo<AuthContextValue>(() => ({
    currentUser,
    loginWithMicrosoft,
    logout,
    authLoading: inProgress !== InteractionStatus.None || (!!account && !current),
    authError,
  }), [currentUser, loginWithMicrosoft, logout, inProgress, account, current, authError])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

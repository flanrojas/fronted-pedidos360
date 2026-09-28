import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { AuthContext, type AuthContextValue } from './AuthContext'
import { readStoredUser, storeUser } from './sessionStorage'
import type { User } from './types'

interface AuthProviderProps {
  children: ReactNode
}

// TODO(fase2): reemplazar por @azure/msal-react (login real con Azure AD)
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(readStoredUser)

  const login = useCallback((user: User) => {
    storeUser(user)
    setCurrentUser(user)
  }, [])

  const logout = useCallback(() => {
    storeUser(null)
    setCurrentUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ currentUser, login, logout }),
    [currentUser, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

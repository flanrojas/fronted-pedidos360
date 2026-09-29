import { createContext } from 'react'
import type { User } from './types'

export interface AuthContextValue {
  currentUser: User | null
  logout: () => void
  loginWithMicrosoft: () => Promise<void>
  authLoading?: boolean
  authError?: string | null
}

export const AuthContext = createContext<AuthContextValue | null>(null)

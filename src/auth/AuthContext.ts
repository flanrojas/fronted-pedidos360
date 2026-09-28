import { createContext } from 'react'
import type { User } from './types'

export interface AuthContextValue {
  currentUser: User | null
  login: (user: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | null>(null)

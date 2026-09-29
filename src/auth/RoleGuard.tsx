import type { ReactNode } from 'react'
import { CircularProgress } from '@mui/material'
import { Navigate, Outlet, useLocation } from 'react-router'
import { can, type Action } from './permissions'
import { useAuth } from './useAuth'

interface RoleGuardProps {
  action?: Action
  children?: ReactNode
}

export function RoleGuard({ action, children }: RoleGuardProps) {
  const { currentUser, authLoading } = useAuth()
  const location = useLocation()

  if (authLoading) return <CircularProgress aria-label="Comprobando sesión" sx={{ m: 4 }} />

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (action && !can(currentUser.role, action)) {
    return <Navigate to="/403" replace />
  }

  return children ?? <Outlet />
}

import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { can, type Action } from './permissions'
import { useAuth } from './useAuth'

interface RoleGuardProps {
  /** Required permission. If omitted, only an active session is required. */
  action?: Action
  children?: ReactNode
}

export function RoleGuard({ action, children }: RoleGuardProps) {
  const { currentUser } = useAuth()
  const location = useLocation()

  if (!currentUser) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (action && !can(currentUser.role, action)) {
    return <Navigate to="/403" replace />
  }

  return children ?? <Outlet />
}

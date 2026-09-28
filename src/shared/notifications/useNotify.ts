import { useContext } from 'react'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import { NotificationContext, type Notification } from './NotificationContext'

export function useNotify() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotify debe usarse dentro de <NotificationProvider>')
  }
  const { notify } = context

  return {
    notify,
    success: (message: string) => notify({ severity: 'success', message }),
    /** Shows `prefix` plus the user-facing message extracted from `error`. */
    error: (prefix: string, error: unknown, details?: Notification['details']) =>
      notify({ severity: 'error', message: `${prefix} ${getErrorMessage(error)}`, details }),
  }
}

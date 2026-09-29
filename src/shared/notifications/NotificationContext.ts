import { createContext } from 'react'

export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  severity: NotificationSeverity
  message: string
  details?: readonly string[]
}

export interface NotificationContextValue {
  notify: (notification: Notification) => void
}

export const NotificationContext = createContext<NotificationContextValue | null>(null)

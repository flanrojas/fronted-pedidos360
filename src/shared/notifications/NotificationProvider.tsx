import { Alert, Box, Snackbar } from '@mui/material'
import { useCallback, useMemo, useState, type ReactNode } from 'react'
import {
  NotificationContext,
  type Notification,
  type NotificationContextValue,
} from './NotificationContext'

interface NotificationProviderProps {
  children: ReactNode
}

interface ActiveNotification extends Notification {
  key: number
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [current, setCurrent] = useState<ActiveNotification | null>(null)

  const notify = useCallback((notification: Notification) => {
    setCurrent({ ...notification, key: Date.now() })
  }, [])

  const value = useMemo<NotificationContextValue>(() => ({ notify }), [notify])
  const persistent = current?.severity === 'error' || current?.severity === 'warning'

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.key}
        open={current !== null}
        autoHideDuration={persistent ? null : 4000}
        onClose={(_, reason) => {
          if (reason !== 'clickaway') setCurrent(null)
        }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={current?.severity ?? 'info'}
          variant="filled"
          onClose={() => setCurrent(null)}
          sx={{ width: '100%', maxWidth: 560 }}
        >
          {current?.message}
          {current?.details && current.details.length > 0 && (
            <Box component="ul" sx={{ m: 0, mt: 0.5, pl: 2.5 }}>
              {current.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </Box>
          )}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  )
}

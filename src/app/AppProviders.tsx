import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { AuthProvider } from '@/auth/AuthProvider'
import { NotificationProvider } from '@/shared/notifications/NotificationProvider'
import { queryClient } from './queryClient'
import { theme } from './theme'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <AuthProvider>{children}</AuthProvider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

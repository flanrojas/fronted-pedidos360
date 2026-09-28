import { CssBaseline, ThemeProvider } from '@mui/material'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { createMemoryRouter, type RouteObject } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { AuthContext, type AuthContextValue } from '@/auth/AuthContext'
import type { User } from '@/auth/types'
import { theme } from '@/app/theme'
import { NotificationProvider } from '@/shared/notifications/NotificationProvider'

interface Options {
  user: User | null
  initialPath: string
  routes: RouteObject[]
}

/** Renders `routes` in a memory router with a fixed session and fresh providers. */
export function renderWithProviders({ user, initialPath, routes }: Options) {
  const router = createMemoryRouter(routes, { initialEntries: [initialPath] })
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const auth: AuthContextValue = { currentUser: user, login: vi.fn(), logout: vi.fn() }

  const result = render(
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <NotificationProvider>
          <AuthContext.Provider value={auth}>
            <RouterProvider router={router} />
          </AuthContext.Provider>
        </NotificationProvider>
      </ThemeProvider>
    </QueryClientProvider>,
  )

  return { ...result, router, auth }
}

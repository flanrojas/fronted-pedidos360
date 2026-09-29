import LoginIcon from '@mui/icons-material/Login'
import { Alert, Box, Button, Card, CardContent, Skeleton, Stack, Typography } from '@mui/material'
import { useState } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from './useAuth'

export function LoginPage() {
  const { currentUser, loginWithMicrosoft, logout, authLoading, authError } = useAuth()
  const [loginError, setLoginError] = useState<string | null>(null)

  if (currentUser) return <Navigate to="/orders" replace />

  const handleLogin = async () => {
    setLoginError(null)
    try {
      await loginWithMicrosoft()
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'No se pudo iniciar sesión con Microsoft.')
    }
  }

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: 'background.default', p: 2 }}>
      <Card sx={{ width: '100%', maxWidth: 520 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>Pedidos360</Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Ingresa con tu cuenta de Microsoft.
          </Typography>
          {(authError || loginError) && <Alert severity="error" sx={{ mb: 2 }}>{loginError ?? authError}</Alert>}
          {authLoading ? (
            <Skeleton variant="rounded" height={42} />
          ) : (
            <Stack spacing={1}>
              <Button variant="contained" startIcon={<LoginIcon />} onClick={() => void handleLogin()}>
                Iniciar sesión con Microsoft
              </Button>
              {authError && <Button onClick={logout}>Cambiar de cuenta</Button>}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

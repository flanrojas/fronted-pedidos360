import LoginIcon from '@mui/icons-material/Login'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { Navigate, useNavigate } from 'react-router'
import { useUsers } from '@/features/users/hooks/useUsers'
import { ROLE_LABELS, type User } from './types'
import { useAuth } from './useAuth'

export function LoginPage() {
  const { currentUser, login } = useAuth()
  const navigate = useNavigate()
  const { data: users, isPending, isError, refetch } = useUsers()

  if (currentUser) {
    return <Navigate to="/orders" replace />
  }

  const handleLogin = (user: User) => {
    login(user)
    navigate('/orders', { replace: true })
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ width: '100%', maxWidth: 520 }}>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            Pedidos360
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            Selecciona un usuario de prueba para ingresar.
          </Typography>

          {isPending && (
            <Stack spacing={1}>
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} variant="rounded" height={56} />
              ))}
            </Stack>
          )}

          {isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => void refetch()}>
                  Reintentar
                </Button>
              }
            >
              No se pudieron cargar los usuarios. ¿Está corriendo el mock (npm run mock)?
            </Alert>
          )}

          {users && users.length === 0 && (
            <Alert severity="info">
              No hay usuarios de prueba. Restaura los datos con npm run mock:reset.
            </Alert>
          )}

          {users && users.length > 0 && (
            <List disablePadding>
              {users.map((user) => (
                <ListItem
                  key={user.id}
                  divider
                  sx={{
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'stretch', sm: 'center' },
                    gap: 1,
                  }}
                >
                  <ListItemText
                    primary={user.name}
                    secondary={
                      <Chip
                        component="span"
                        label={ROLE_LABELS[user.role]}
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    }
                  />
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<LoginIcon />}
                    onClick={() => handleLogin(user)}
                    aria-label={`Entrar como ${user.name}`}
                    sx={{ flexShrink: 0 }}
                  >
                    Entrar como…
                  </Button>
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}

import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, Box, Button, Chip, Drawer, IconButton, Toolbar, Typography } from '@mui/material'
import { useState } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router'
import { ROLE_LABELS } from '@/auth/types'
import { useAuth } from '@/auth/useAuth'
import { NavMenu } from './NavMenu'
import { BRAND } from './theme'

const DRAWER_WIDTH = 240

/** Coffee-beans photo behind the menu, faded by a cream overlay (photo ~12% visible). */
const MENU_BACKGROUND = {
  backgroundColor: BRAND.paper,
  backgroundImage: `linear-gradient(rgba(255, 252, 247, 0.88), rgba(255, 252, 247, 0.88)), url('/images/menu-fondo.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
} as const

export function AppLayout() {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            aria-label="Abrir menú"
            onClick={() => setMobileOpen(true)}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }} noWrap>
            Pedidos360
          </Typography>
          <Typography variant="body2" noWrap sx={{ display: { xs: 'none', sm: 'block' } }}>
            {currentUser.name}
          </Typography>
          <Chip
            label={ROLE_LABELS[currentUser.role]}
            size="small"
            sx={{ bgcolor: 'rgba(255, 255, 255, 0.2)', color: 'inherit' }}
          />
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            aria-label="Salir"
            sx={{ minWidth: 0, '& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } } }}
          >
            <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
              Salir
            </Box>
          </Button>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {/* Mobile: temporary drawer, only mounted while open */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { width: DRAWER_WIDTH, ...MENU_BACKGROUND },
          }}
        >
          <NavMenu role={currentUser.role} onNavigate={() => setMobileOpen(false)} />
        </Drawer>
        {/* Desktop: permanent drawer */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              ...MENU_BACKGROUND,
            },
          }}
        >
          <NavMenu role={currentUser.role} />
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, p: { xs: 2, md: 3 } }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  )
}

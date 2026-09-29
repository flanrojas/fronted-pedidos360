import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import { AppBar, Box, Button, Chip, Drawer, IconButton, Toolbar, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'
import { Navigate, Outlet } from 'react-router'
import { ROLE_LABELS } from '@/auth/types'
import { useAuth } from '@/auth/useAuth'
import { NavMenu } from './NavMenu'
import { BRAND } from './theme'

const DRAWER_WIDTH = 240

const MENU_BACKGROUND = {
  backgroundColor: BRAND.background,
  backgroundImage: `linear-gradient(${alpha(BRAND.background, 0.88)}, ${alpha(BRAND.background, 0.88)}), url('/images/papas.jpg')`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
} as const

export function AppLayout() {
  const { currentUser, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (!currentUser) {
    return <Navigate to="/login" replace />
  }

  const handleLogout = () => {
    logout()
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          color: BRAND.navy,
          background: `linear-gradient(90deg, ${BRAND.yellowLight}, ${BRAND.yellow})`,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backgroundImage: "url('/images/mis-pedidos-comida.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            opacity: 0.15,
            maskImage: 'linear-gradient(90deg, transparent 35%, black 100%)',
            WebkitMaskImage: 'linear-gradient(90deg, transparent 35%, black 100%)',
            pointerEvents: 'none',
          },
        }}
      >
        <Toolbar sx={{ gap: 1, position: 'relative' }}>
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
            sx={{ bgcolor: alpha(BRAND.navy, 0.1), color: 'inherit' }}
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

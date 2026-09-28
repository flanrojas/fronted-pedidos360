import { List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material'
import { Link, useLocation } from 'react-router'
import { can } from '@/auth/permissions'
import type { Role } from '@/auth/types'
import { NAV_ITEMS } from './navigation'

interface NavMenuProps {
  role: Role
  onNavigate?: () => void
}

export function NavMenu({ role, onNavigate }: NavMenuProps) {
  const { pathname } = useLocation()
  const items = NAV_ITEMS.filter((item) => can(role, item.action))

  return (
    <>
      <Toolbar />
      <List component="nav" aria-label="Menú principal">
        {items.map((item) => (
          <ListItemButton
            key={item.to}
            component={Link}
            to={item.to}
            selected={pathname.startsWith(item.to)}
            onClick={onNavigate}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </>
  )
}

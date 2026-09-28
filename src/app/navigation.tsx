import { Box } from '@mui/material'
import type { ReactElement } from 'react'
import type { Action } from '@/auth/permissions'

export interface NavItem {
  label: string
  to: string
  action: Action
  icon: ReactElement
}

/** Custom menu icon from public/. Decorative (alt=""): the menu item already has its label. */
function navIcon(src: string): ReactElement {
  return <Box component="img" src={src} alt="" sx={{ width: 24, height: 24, display: 'block' }} />
}

export const NAV_ITEMS: readonly NavItem[] = [
  { label: 'Pedidos', to: '/orders', action: 'orders:view', icon: navIcon('/pedido.png') },
  { label: 'Catálogo', to: '/catalog', action: 'catalog:view', icon: navIcon('/catalogar.png') },
]

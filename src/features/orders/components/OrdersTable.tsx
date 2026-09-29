import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import { useNavigate } from 'react-router'
import { formatCLP } from '@/shared/utils/formatCurrency'
import { formatDateTime } from '@/shared/utils/formatDate'
import type { Order } from '../types'
import { countUnits } from '../utils/orderTotals'
import { OrderStatusBadge } from './OrderStatusBadge'

interface OrdersTableProps {
  orders: readonly Order[]
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const navigate = useNavigate()
  const open = (order: Order) => navigate(`/orders/${order.id}`)

  return (
    <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
      <Table size="small" aria-label="Listado de pedidos" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell>N°</TableCell>
            <TableCell>Cliente</TableCell>
            <TableCell>Fecha</TableCell>
            <TableCell align="right">Ítems</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell>Estado</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map((order) => (
            <TableRow
              key={order.id}
              hover
              tabIndex={0}
              aria-label={`Pedido N° ${order.id}`}
              onClick={() => open(order)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') open(order)
              }}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{order.id}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatDateTime(order.createdAt)}</TableCell>
              <TableCell align="right">{countUnits(order.items)}</TableCell>
              <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                {order.items.some((item) => item.priceKnown === false) ? '—' : formatCLP(order.total)}
              </TableCell>
              <TableCell>
                <OrderStatusBadge status={order.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

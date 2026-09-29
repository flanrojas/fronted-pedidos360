import { Button, MenuItem, Stack, TextField } from '@mui/material'
import { parseId, type EntityId } from '@/shared/utils/entityId'
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from '../types'
import { EMPTY_ORDER_FILTERS, type OrderFilters } from '../utils/filterOrders'

interface OrderFiltersBarProps {
  filters: OrderFilters
  onChange: (filters: OrderFilters) => void
  customers?: readonly { id: EntityId; name: string }[]
}

export function OrderFiltersBar({ filters, onChange, customers }: OrderFiltersBarProps) {
  const set = <K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) =>
    onChange({ ...filters, [key]: value })

  const hasFilters =
    filters.status !== 'all' || filters.from || filters.to || filters.customerId !== 'all'

  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{ mb: 2, gap: 2, flexWrap: 'wrap', alignItems: { md: 'center' } }}
    >
      <TextField
        select
        label="Estado"
        size="small"
        value={filters.status}
        onChange={(event) => set('status', event.target.value as OrderStatus | 'all')}
        sx={{ minWidth: 170 }}
      >
        <MenuItem value="all">Todos</MenuItem>
        {ORDER_STATUSES.map((status) => (
          <MenuItem key={status} value={status}>
            {STATUS_LABELS[status]}
          </MenuItem>
        ))}
      </TextField>
      <Stack direction="row" spacing={2}>
        <TextField
          label="Desde"
          type="date"
          size="small"
          value={filters.from}
          onChange={(event) => set('from', event.target.value)}
          slotProps={{ inputLabel: { shrink: true }, htmlInput: { max: filters.to || undefined } }}
        />
        <TextField
          label="Hasta"
          type="date"
          size="small"
          value={filters.to}
          onChange={(event) => set('to', event.target.value)}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: filters.from || undefined },
          }}
        />
      </Stack>
      {customers && (
        <TextField
          select
          label="Cliente"
          size="small"
          value={filters.customerId}
          onChange={(event) =>
            set('customerId', event.target.value === 'all' ? 'all' : parseId(event.target.value))
          }
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="all">Todos</MenuItem>
          {customers.map((customer) => (
            <MenuItem key={customer.id} value={customer.id}>
              {customer.name}
            </MenuItem>
          ))}
        </TextField>
      )}
      {hasFilters && (
        <Button onClick={() => onChange(EMPTY_ORDER_FILTERS)} sx={{ alignSelf: 'flex-start' }}>
          Limpiar filtros
        </Button>
      )}
    </Stack>
  )
}

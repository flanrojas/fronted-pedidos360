import CircleIcon from '@mui/icons-material/Circle'
import { List, ListItem, ListItemIcon, ListItemText } from '@mui/material'
import { formatDateTime } from '@/shared/utils/formatDate'
import { STATUS_LABELS, type StatusHistoryEntry } from '../types'

interface OrderHistoryTimelineProps {
  history: readonly StatusHistoryEntry[]
}

export function OrderHistoryTimeline({ history }: OrderHistoryTimelineProps) {
  const entries = [...history].sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())

  return (
    <List dense aria-label="Historial de estados">
      {entries.map((entry, index) => {
        const isLast = index === entries.length - 1
        return (
          <ListItem
            key={`${entry.status}-${entry.at}`}
            sx={{
              alignItems: 'flex-start',
              position: 'relative',
              '&::before': isLast
                ? undefined
                : {
                    content: '""',
                    position: 'absolute',
                    left: 23,
                    top: 26,
                    bottom: -6,
                    borderLeft: 2,
                    borderColor: 'divider',
                  },
            }}
          >
            <ListItemIcon sx={{ minWidth: 32, mt: 0.75 }}>
              <CircleIcon
                color="secondary"
                sx={{ fontSize: 14, opacity: isLast ? 1 : 0.45 }}
                data-current={isLast || undefined}
              />
            </ListItemIcon>
            <ListItemText
              primary={STATUS_LABELS[entry.status]}
              secondary={`${formatDateTime(entry.at)} · por ${entry.by}`}
              slotProps={{ primary: { sx: { fontWeight: isLast ? 600 : 400 } } }}
            />
          </ListItem>
        )
      })}
    </List>
  )
}

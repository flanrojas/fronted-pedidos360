import InboxIcon from '@mui/icons-material/Inbox'
import { Paper, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  action?: ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
      <InboxIcon color="disabled" sx={{ fontSize: 48 }} />
      <Typography variant="h6" component="p">
        {title}
      </Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
      {action && <Typography sx={{ mt: 2 }}>{action}</Typography>}
    </Paper>
  )
}

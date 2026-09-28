import { Alert, Button } from '@mui/material'

interface QueryErrorAlertProps {
  message: string
  onRetry?: () => void
}

export function QueryErrorAlert({ message, onRetry }: QueryErrorAlertProps) {
  return (
    <Alert
      severity="error"
      action={
        onRetry && (
          <Button color="inherit" size="small" onClick={onRetry}>
            Reintentar
          </Button>
        )
      }
    >
      {message}
    </Alert>
  )
}

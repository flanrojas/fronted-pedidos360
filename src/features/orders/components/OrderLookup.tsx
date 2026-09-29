import SearchIcon from '@mui/icons-material/Search'
import { Button, Paper, Stack, TextField } from '@mui/material'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'

export function OrderLookup() {
  const navigate = useNavigate()
  const [id, setId] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    const value = id.trim()
    if (!value) {
      setError('Ingresa el N° del pedido')
      return
    }
    navigate(`/orders/${encodeURIComponent(value)}`)
  }

  return (
    <Stack spacing={2}>
     
      <Paper
        component="form"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Buscar pedido"
        sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}
      >
        <TextField
          label="N° de pedido"
          size="small"
          value={id}
          onChange={(event) => {
            setId(event.target.value)
            setError(null)
          }}
          error={!!error}
          helperText={error ?? 'Por ejemplo: 5b70b6e1-1522-478c-9f7b-956c70a523df'}
          sx={{ flexGrow: 1, minWidth: 260 }}
        />
        <Button type="submit" variant="contained" startIcon={<SearchIcon />}>
          Ver pedido
        </Button>
      </Paper>
    </Stack>
  )
}

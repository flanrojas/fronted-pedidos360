import { Box, Button, Typography } from '@mui/material'
import { Link } from 'react-router'

interface MessagePageProps {
  code: string
  title: string
  description: string
}

export function MessagePage({ code, title, description }: MessagePageProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
      <Typography variant="h2" component="p" color="primary" sx={{ fontWeight: 700 }}>
        {code}
      </Typography>
      <Typography variant="h5" component="h1" gutterBottom>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        {description}
      </Typography>
      <Button variant="contained" component={Link} to="/orders">
        Ir a Pedidos
      </Button>
    </Box>
  )
}

import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'
import { Box, type SxProps, type Theme } from '@mui/material'
import { useState } from 'react'

interface ProductImageProps {
  src?: string
  alt: string
  sx?: SxProps<Theme>
}

export function ProductImage({ src, alt, sx }: ProductImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null)
  const showPlaceholder = !src || failedSrc === src

  return (
    <Box
      sx={[
        {
          position: 'relative',
          overflow: 'hidden',
          bgcolor: 'grey.100',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {showPlaceholder ? (
        <ImageNotSupportedOutlinedIcon
          titleAccess={`${alt} (sin foto)`}
          sx={{ color: 'grey.400', fontSize: '2.5em', maxWidth: '60%', maxHeight: '60%' }}
        />
      ) : (
        <Box
          component="img"
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailedSrc(src)}
          sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
        />
      )}
    </Box>
  )
}

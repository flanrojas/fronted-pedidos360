import { esES } from '@mui/material/locale'
import { createTheme } from '@mui/material/styles'

/**
 * Warm bakery palette: dark brown, golden orange and cream.
 * Status colors keep their meaning (success/warning/error/info) in warm tones,
 * all with at least 4.5:1 contrast against their text color (see theme.test.ts).
 */
export const BRAND = {
  brown: '#8A5222',
  brownDark: '#6B3E17',
  brownLight: '#A8703C',
  golden: '#E3A21A',
  cream: '#F6EBDD',
  paper: '#FFFCF7',
  ink: '#3B2410',
  inkMuted: '#6E4F35',
} as const

/** Rounded display font for headings/buttons (close to the reference logo) and a readable body font. */
const DISPLAY_FONT = '"Fredoka", "Nunito", system-ui, sans-serif'
const BODY_FONT = '"Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

const heading = { fontFamily: DISPLAY_FONT, fontWeight: 600, letterSpacing: 0 }

export const theme = createTheme(
  {
    palette: {
      primary: {
        main: BRAND.brown,
        dark: BRAND.brownDark,
        light: BRAND.brownLight,
        contrastText: '#FFFFFF',
      },
      secondary: { main: BRAND.golden, contrastText: BRAND.ink },
      info: { main: '#4F6F8F', contrastText: '#FFFFFF' },
      success: { main: '#46722D', contrastText: '#FFFFFF' },
      warning: { main: '#A64D00', contrastText: '#FFFFFF' },
      error: { main: '#B3261E', contrastText: '#FFFFFF' },
      background: { default: BRAND.cream, paper: BRAND.paper },
      text: { primary: BRAND.ink, secondary: BRAND.inkMuted },
      divider: 'rgba(138, 82, 34, 0.16)',
      // Warm greys (used by the photo placeholder) instead of MUI's cool greys.
      grey: { 100: '#F3E7D8', 400: '#B9A28A' },
    },
    shape: { borderRadius: 8 },
    typography: {
      fontFamily: BODY_FONT,
      h1: heading,
      h2: { ...heading, fontWeight: 700 },
      h3: heading,
      h4: heading,
      h5: heading,
      h6: heading,
      button: { fontFamily: DISPLAY_FONT, fontWeight: 600, letterSpacing: '0.02em' },
      overline: { fontFamily: DISPLAY_FONT, fontWeight: 500, letterSpacing: '0.08em' },
    },
  },
  esES,
)

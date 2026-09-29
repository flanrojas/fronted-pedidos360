import { esES } from '@mui/material/locale'
import { createTheme } from '@mui/material/styles'


export const BRAND = {
  goldDark: '#8A5B00',
  gold: '#CC8C05',
  yellow: '#FCA801',
  yellowLight: '#FFD323',
  lemon: '#FFF86A',
  cream: '#FFFFAF',
  blue: '#003F66',
  navy: '#011B2F',
  background: '#FFFBD6',
  paper: '#FFFFFF',
  inkMuted: '#4B4A30',
} as const

const DISPLAY_FONT = '"Fredoka", "Nunito", system-ui, sans-serif'
const BODY_FONT = '"Nunito", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif'

const heading = { fontFamily: DISPLAY_FONT, fontWeight: 600, letterSpacing: 0 }

export const theme = createTheme(
  {
    palette: {
      primary: {
        main: BRAND.goldDark,
        light: BRAND.gold,
        contrastText: '#FFFFFF',
      },
      secondary: { main: BRAND.yellowLight, light: BRAND.lemon, contrastText: BRAND.navy },
      info: { main: BRAND.blue, contrastText: '#FFFFFF' },
      success: { main: '#46722D', contrastText: '#FFFFFF' },
      warning: { main: '#A64D00', contrastText: '#FFFFFF' },
      error: { main: '#B3261E', contrastText: '#FFFFFF' },
      background: { default: BRAND.background, paper: BRAND.paper },
      text: { primary: BRAND.navy, secondary: BRAND.inkMuted },
      divider: 'rgba(138, 91, 0, 0.18)',
      grey: { 100: '#FFF9E1', 400: '#B8A778' },
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

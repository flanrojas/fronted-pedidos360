import { theme } from './theme'

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const channel = parseInt(hex.slice(i, i + 2), 16) / 255
    return channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (light + 0.05) / (dark + 0.05)
}

const { palette } = theme

describe('theme palette contrast (WCAG AA, 4.5:1)', () => {
  it.each(['primary', 'secondary', 'info', 'success', 'warning', 'error'] as const)(
    '%s text is readable on its background',
    (color) => {
      expect(contrast(palette[color].main, palette[color].contrastText)).toBeGreaterThanOrEqual(4.5)
    },
  )

  it.each(['primary', 'warning', 'error', 'success'] as const)(
    '%s.main is readable as text on the page and on cards',
    (color) => {
      expect(contrast(palette[color].main, palette.background.default)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(palette[color].main, palette.background.paper)).toBeGreaterThanOrEqual(4.5)
    },
  )

  it('body and secondary text are readable on the page and on cards', () => {
    for (const bg of [palette.background.default, palette.background.paper]) {
      expect(contrast(palette.text.primary, bg)).toBeGreaterThanOrEqual(4.5)
      expect(contrast(palette.text.secondary, bg)).toBeGreaterThanOrEqual(4.5)
    }
  })
})

import { formatCLP } from './formatCurrency'

describe('formatCLP', () => {
  it('formats integers as Chilean pesos', () => {
    expect(formatCLP(15990)).toBe('$15.990')
    expect(formatCLP(0)).toBe('$0')
    expect(formatCLP(1250000)).toBe('$1.250.000')
  })
})

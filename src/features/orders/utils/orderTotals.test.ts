import { calculateSubtotal, calculateTotal, countUnits } from './orderTotals'

describe('orderTotals', () => {
  it('calculates a line subtotal', () => {
    expect(calculateSubtotal({ quantity: 3, unitPrice: 2490 })).toBe(7470)
  })

  it('calculates the total of several lines', () => {
    const items = [
      { quantity: 2, unitPrice: 15990 },
      { quantity: 1, unitPrice: 1890 },
    ]
    expect(calculateTotal(items)).toBe(33870)
  })

  it('returns 0 for an empty order', () => {
    expect(calculateTotal([])).toBe(0)
  })

  it('keeps CLP integers exact', () => {
    expect(calculateTotal([{ quantity: 7, unitPrice: 3290 }])).toBe(23030)
  })

  it('counts total units', () => {
    expect(countUnits([{ quantity: 2 }, { quantity: 3 }])).toBe(5)
    expect(countUnits([])).toBe(0)
  })
})

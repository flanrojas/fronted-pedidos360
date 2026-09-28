import { applyStockAdjustment } from '../utils/stockAdjustment'
import { createAdjustStockSchema } from './adjustStockSchema'

describe('applyStockAdjustment', () => {
  it('adds and subtracts', () => {
    expect(applyStockAdjustment(5, 'add', 3)).toBe(8)
    expect(applyStockAdjustment(5, 'subtract', 3)).toBe(2)
    expect(applyStockAdjustment(5, 'subtract', 7)).toBe(-2)
  })
})

describe('adjustStockSchema', () => {
  const schema = createAdjustStockSchema(5)

  it('allows subtracting down to exactly 0', () => {
    expect(schema.safeParse({ mode: 'subtract', quantity: 5 }).success).toBe(true)
  })

  it('rejects leaving stock negative', () => {
    const result = schema.safeParse({ mode: 'subtract', quantity: 6 })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path).toEqual(['quantity'])
  })

  it('allows adding any positive integer', () => {
    expect(schema.safeParse({ mode: 'add', quantity: 100 }).success).toBe(true)
  })

  it.each([0, -1, 1.5, Number.NaN])('rejects quantity %s', (quantity) => {
    expect(schema.safeParse({ mode: 'add', quantity }).success).toBe(false)
  })
})

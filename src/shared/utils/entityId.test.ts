import { isValidId, parseId } from './entityId'

describe('parseId', () => {
  it('turns numeric strings into numbers (mock ids and route params)', () => {
    expect(parseId('3')).toBe(3)
    expect(parseId(' 42 ')).toBe(42)
    expect(parseId(7)).toBe(7)
  })

  it('keeps UUIDs and other text as strings (backend ids)', () => {
    expect(parseId('5b70b6e1-1522-478c-9f7b-956c70a523df')).toBe(
      '5b70b6e1-1522-478c-9f7b-956c70a523df',
    )
    expect(parseId('1e5')).toBe('1e5')
  })
})

describe('isValidId', () => {
  it.each([1, 99, 'abc', '5b70b6e1-1522-478c-9f7b-956c70a523df'])('accepts %s', (id) => {
    expect(isValidId(id)).toBe(true)
  })

  it.each([0, -1, 1.5, Number.NaN, '', '   ', undefined, null])('rejects %s', (id) => {
    expect(isValidId(id)).toBe(false)
  })
})

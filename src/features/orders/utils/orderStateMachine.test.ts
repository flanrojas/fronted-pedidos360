import { ORDER_STATUSES, type OrderStatus } from '../types'
import { canTransition, getAllowedTransitions, isFinalStatus } from './orderStateMachine'

const VALID: ReadonlyArray<[OrderStatus, OrderStatus]> = [
  ['CREATED', 'ACCEPTED'],
  ['CREATED', 'CANCELLED'],
  ['ACCEPTED', 'PREPARING'],
  ['ACCEPTED', 'CANCELLED'],
  ['PREPARING', 'DISPATCHED'],
  ['DISPATCHED', 'DELIVERED'],
]

const isValid = (from: OrderStatus, to: OrderStatus) =>
  VALID.some(([f, t]) => f === from && t === to)

const INVALID = ORDER_STATUSES.flatMap((from) =>
  ORDER_STATUSES.filter((to) => !isValid(from, to)).map((to) => [from, to] as const),
)

describe('orderStateMachine', () => {
  it('covers every pair of statuses', () => {
    expect(VALID.length + INVALID.length).toBe(ORDER_STATUSES.length ** 2)
  })

  it.each(VALID)('%s → %s is valid', (from, to) => {
    expect(canTransition(from, to)).toBe(true)
  })

  it.each(INVALID)('%s → %s is invalid', (from, to) => {
    expect(canTransition(from, to)).toBe(false)
  })

  it('cannot dispatch an order that was not accepted (CREATED → DISPATCHED)', () => {
    expect(canTransition('CREATED', 'DISPATCHED')).toBe(false)
    expect(getAllowedTransitions('CREATED')).not.toContain('DISPATCHED')
  })

  it('cannot skip preparation (ACCEPTED → DISPATCHED)', () => {
    expect(canTransition('ACCEPTED', 'DISPATCHED')).toBe(false)
  })

  it('cannot cancel once preparation started', () => {
    expect(canTransition('PREPARING', 'CANCELLED')).toBe(false)
    expect(canTransition('DISPATCHED', 'CANCELLED')).toBe(false)
  })

  it('lists allowed transitions per status', () => {
    expect(getAllowedTransitions('CREATED')).toEqual(['ACCEPTED', 'CANCELLED'])
    expect(getAllowedTransitions('ACCEPTED')).toEqual(['PREPARING', 'CANCELLED'])
    expect(getAllowedTransitions('PREPARING')).toEqual(['DISPATCHED'])
    expect(getAllowedTransitions('DISPATCHED')).toEqual(['DELIVERED'])
  })

  it('DELIVERED and CANCELLED are final', () => {
    expect(getAllowedTransitions('DELIVERED')).toEqual([])
    expect(getAllowedTransitions('CANCELLED')).toEqual([])
    expect(isFinalStatus('DELIVERED')).toBe(true)
    expect(isFinalStatus('CANCELLED')).toBe(true)
    expect(isFinalStatus('CREATED')).toBe(false)
  })

  it('no status can go back to CREATED', () => {
    for (const from of ORDER_STATUSES) expect(canTransition(from, 'CREATED')).toBe(false)
  })
})

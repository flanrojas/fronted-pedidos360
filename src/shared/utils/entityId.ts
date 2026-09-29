export type EntityId = number | string

export function parseId(value: string | number): EntityId {
  if (typeof value === 'number') return value
  const trimmed = value.trim()
  return /^\d+$/.test(trimmed) ? Number(trimmed) : trimmed
}

export function isValidId(value: EntityId | undefined | null): value is EntityId {
  if (typeof value === 'number') return Number.isInteger(value) && value > 0
  return typeof value === 'string' && value.trim().length > 0
}

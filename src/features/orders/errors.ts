import type { EntityId } from '@/shared/utils/entityId'
import { STATUS_LABELS, type OrderStatus } from './types'

export class OrderDomainError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'OrderDomainError'
  }
}

export class InvalidTransitionError extends OrderDomainError {
  readonly from: OrderStatus
  readonly to: OrderStatus

  constructor(from: OrderStatus, to: OrderStatus) {
    super(`No se puede pasar un pedido de «${STATUS_LABELS[from]}» a «${STATUS_LABELS[to]}».`)
    this.name = 'InvalidTransitionError'
    this.from = from
    this.to = to
  }
}

export interface StockShortage {
  productId: EntityId
  productName: string
  requested: number
  available: number
}

export class InsufficientStockError extends OrderDomainError {
  readonly shortages: readonly StockShortage[]

  constructor(shortages: readonly StockShortage[]) {
    const detail = shortages
      .map((s) => `${s.productName} (pedido: ${s.requested}, disponible: ${s.available})`)
      .join('; ')
    super(`Stock insuficiente para aceptar el pedido: ${detail}.`)
    this.name = 'InsufficientStockError'
    this.shortages = shortages
  }
}

export class StaleOrderError extends OrderDomainError {
  constructor() {
    super('El pedido fue modificado por otra persona. Se recargaron los datos; inténtalo de nuevo.')
    this.name = 'StaleOrderError'
  }
}

export class StatusChangeForbiddenError extends OrderDomainError {
  constructor() {
    super('Tu rol no tiene permiso para cambiar el estado de un pedido.')
    this.name = 'StatusChangeForbiddenError'
  }
}

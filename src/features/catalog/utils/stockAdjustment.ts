export type StockAdjustmentMode = 'add' | 'subtract'

/** Returns the resulting stock. May be negative: callers must reject that case. */
export function applyStockAdjustment(
  currentStock: number,
  mode: StockAdjustmentMode,
  quantity: number,
): number {
  return mode === 'add' ? currentStock + quantity : currentStock - quantity
}

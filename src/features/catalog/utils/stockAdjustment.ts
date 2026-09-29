export type StockAdjustmentMode = 'add' | 'subtract'

export function applyStockAdjustment(
  currentStock: number,
  mode: StockAdjustmentMode,
  quantity: number,
): number {
  return mode === 'add' ? currentStock + quantity : currentStock - quantity
}

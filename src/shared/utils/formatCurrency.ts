const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

export function formatCLP(amount: number): string {
  return clpFormatter.format(amount)
}

const clpFormatter = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' })

/** Formats an integer CLP amount, e.g. 15990 → "$15.990". */
export function formatCLP(amount: number): string {
  return clpFormatter.format(amount)
}

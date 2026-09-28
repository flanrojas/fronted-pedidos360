/** Responsive card grid shared by the catalog and its loading skeleton. */
export const PRODUCT_GRID_SX = {
  display: 'grid',
  gap: 2,
  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
} as const

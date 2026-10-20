import AddIcon from '@mui/icons-material/Add'
import { Box, Button, Stack, Typography } from '@mui/material'
import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { can } from '@/auth/permissions'
import { useAuth } from '@/auth/useAuth'
import { EmptyState } from '@/shared/components/EmptyState'
import { QueryErrorAlert } from '@/shared/components/QueryErrorAlert'
import { getErrorMessage } from '@/shared/utils/getErrorMessage'
import { AdjustStockDialog } from '../components/AdjustStockDialog'
import { DeleteProductDialog } from '../components/DeleteProductDialog'
import { CatalogSkeleton } from '../components/CatalogSkeleton'
import { CatalogToolbar, type CatalogView } from '../components/CatalogToolbar'
import { ProductCard } from '../components/ProductCard'
import { PRODUCT_GRID_SX } from '../components/productGridSx'
import { ProductTable } from '../components/ProductTable'
import { ToggleActiveDialog } from '../components/ToggleActiveDialog'
import { useProducts } from '../hooks/useProducts'
import type { Product, ProductStatusFilter } from '../types'
import { filterProducts } from '../utils/filterProducts'

export function CatalogPage() {
  const { currentUser } = useAuth()
  const canManage = currentUser !== null && can(currentUser.role, 'catalog:manage')
  const canDelete = currentUser !== null && can(currentUser.role, 'catalog:delete')
  const { data: products, isPending, isError, error, refetch } = useProducts()

  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<ProductStatusFilter>('all')
  const [view, setView] = useState<CatalogView>('grid')
  const [adjusting, setAdjusting] = useState<Product | null>(null)
  const [toggling, setToggling] = useState<Product | null>(null)
  const [deleting, setDeleting] = useState<Product | null>(null)
  // Only roles with catalog:delete get the delete action.
  const onDelete = canDelete ? setDeleting : undefined

  const visibleProducts = useMemo(
    () => filterProducts(products ?? [], { search, status }),
    [products, search, status],
  )

  const renderContent = () => {
    if (isPending) return <CatalogSkeleton view={view} />
    if (isError) {
      return (
        <QueryErrorAlert
          message={`No se pudo cargar el catálogo. ${getErrorMessage(error)}`}
          onRetry={() => void refetch()}
        />
      )
    }
    if (products.length === 0) {
      return <EmptyState title="Aún no hay productos en el catálogo" />
    }
    if (visibleProducts.length === 0) {
      return (
        <EmptyState
          title="No hay productos que coincidan"
          description="Prueba con otra búsqueda o cambia el filtro de estado."
        />
      )
    }
    if (view === 'list') {
      return (
        <ProductTable
          products={visibleProducts}
          canManage={canManage}
          onAdjustStock={setAdjusting}
          onToggleActive={setToggling}
          onDelete={onDelete}
        />
      )
    }
    return (
      <Box sx={PRODUCT_GRID_SX}>
        {visibleProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            canManage={canManage}
            onAdjustStock={setAdjusting}
            onToggleActive={setToggling}
            onDelete={onDelete}
          />
        ))}
      </Box>
    )
  }

  return (
    <>
      <Stack
        direction="row"
        sx={{
          mb: 2,
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h5" component="h1">
          Catálogo
        </Typography>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} component={Link} to="/catalog/new">
            Nuevo producto
          </Button>
        )}
      </Stack>

      <CatalogToolbar
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        view={view}
        onViewChange={setView}
      />

      {renderContent()}

      {adjusting && <AdjustStockDialog product={adjusting} onClose={() => setAdjusting(null)} />}
      {toggling && <ToggleActiveDialog product={toggling} onClose={() => setToggling(null)} />}
      {deleting && <DeleteProductDialog product={deleting} onClose={() => setDeleting(null)} />}
    </>
  )
}

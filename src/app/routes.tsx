import { Navigate, type RouteObject } from 'react-router'
import { LoginPage } from '@/auth/LoginPage'
import { RoleGuard } from '@/auth/RoleGuard'
import { CatalogPage } from '@/features/catalog/pages/CatalogPage'
import { ProductFormPage } from '@/features/catalog/pages/ProductFormPage'
import { OrderDetailPage } from '@/features/orders/pages/OrderDetailPage'
import { OrderFormPage } from '@/features/orders/pages/OrderFormPage'
import { OrderListPage } from '@/features/orders/pages/OrderListPage'
import { AppLayout } from './AppLayout'
import { ForbiddenPage } from './pages/ForbiddenPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes: RouteObject[] = [
  { path: '/login', element: <LoginPage /> },
  {
    element: <RoleGuard />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/orders" replace /> },
          {
            element: <RoleGuard action="orders:view" />,
            children: [
              { path: 'orders', element: <OrderListPage /> },
              { path: 'orders/:id', element: <OrderDetailPage /> },
            ],
          },
          {
            element: <RoleGuard action="orders:create" />,
            children: [{ path: 'orders/new', element: <OrderFormPage /> }],
          },
          {
            element: <RoleGuard action="catalog:view" />,
            children: [{ path: 'catalog', element: <CatalogPage /> }],
          },
          {
            element: <RoleGuard action="catalog:manage" />,
            children: [
              { path: 'catalog/new', element: <ProductFormPage /> },
              { path: 'catalog/:id/edit', element: <ProductFormPage /> },
            ],
          },
          { path: '403', element: <ForbiddenPage /> },
          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]

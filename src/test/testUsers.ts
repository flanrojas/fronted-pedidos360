import type { User } from '@/auth/types'

export const adminUser: User = {
  id: 1,
  name: 'Andrea Soto',
  email: 'admin@pedidos360.cl',
  role: 'ADMIN',
}

export const operatorUser: User = {
  id: 2,
  name: 'Carlos Muñoz',
  email: 'operador@pedidos360.cl',
  role: 'OPERATOR',
}

export const customerUser: User = {
  id: 3,
  name: 'Valentina Rojas',
  email: 'valentina.rojas@correo.cl',
  role: 'CUSTOMER',
}

export const otherCustomerUser: User = {
  id: 4,
  name: 'Diego Fuentes',
  email: 'diego.fuentes@correo.cl',
  role: 'CUSTOMER',
}

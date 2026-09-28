import { useQuery } from '@tanstack/react-query'
import { usersService } from '../services/usersService'

export function useUsers({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersService.list,
    enabled,
  })
}

/** Users with the CUSTOMER role (an OPERATOR creates orders on their behalf). */
export function useCustomers({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['users'],
    queryFn: usersService.list,
    select: (users) => users.filter((user) => user.role === 'CUSTOMER'),
    enabled,
  })
}

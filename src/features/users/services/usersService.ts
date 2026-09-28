import type { User } from '@/auth/types'
import { apiClient } from '@/shared/api/apiClient'

export const usersService = {
  async list(): Promise<User[]> {
    const { data } = await apiClient.get<User[]>('/users')
    return data
  },
}

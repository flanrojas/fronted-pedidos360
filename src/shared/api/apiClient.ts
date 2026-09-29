import axios from 'axios'
import { getApiAccessToken } from '@/auth/entraConfig'
import { backendBaseUrl } from './apiMode'

export const apiClient = axios.create({
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use(async (config) => {
  config.baseURL = backendBaseUrl()
  config.headers.set('Authorization', `Bearer ${await getApiAccessToken()}`)
  return config
})

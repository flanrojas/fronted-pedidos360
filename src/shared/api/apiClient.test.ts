import { type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { getApiAccessToken } from '@/auth/entraConfig'
import { apiClient } from './apiClient'

vi.mock('@/auth/entraConfig', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/auth/entraConfig')>(),
  getApiAccessToken: vi.fn(),
}))

function captureRequests() {
  const sent: InternalAxiosRequestConfig[] = []
  const adapter: AxiosAdapter = async (config) => {
    sent.push(config)
    return { data: null, status: 200, statusText: 'OK', headers: {}, config }
  }
  apiClient.defaults.adapter = adapter
  return sent
}

describe('apiClient', () => {
  beforeEach(() => {
    vi.mocked(getApiAccessToken).mockResolvedValue('api-access-token')
  })

  afterEach(() => {
    apiClient.defaults.adapter = undefined
    vi.restoreAllMocks()
  })

  it('sends a bearer token to the backend through the Vite proxy', async () => {
    const sent = captureRequests()
    await apiClient.get('/api/orders', { params: { cliente_id: 'front-001' } })

    expect(sent[0].baseURL).toBe('')
    expect(sent[0].headers.get('Authorization')).toBe('Bearer api-access-token')
    expect(sent[0].params).toEqual({ cliente_id: 'front-001' })
  })

  it('calls the backend URL directly when the proxy is disabled', async () => {
    vi.stubEnv('VITE_BACKEND_PROXY', 'false')
    vi.stubEnv('VITE_BACKEND_URL', 'https://abc123.execute-api.us-east-1.amazonaws.com/dev/')
    const sent = captureRequests()
    await apiClient.get('/api/catalog')
    expect(sent[0].baseURL).toBe('https://abc123.execute-api.us-east-1.amazonaws.com/dev')
  })

})

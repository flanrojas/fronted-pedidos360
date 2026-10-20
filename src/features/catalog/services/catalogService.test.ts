import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { apiClient } from '@/shared/api/apiClient'
import { catalogService } from './catalogService'

vi.mock('@/shared/api/apiClient', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

function httpError(status: number, data: unknown) {
  const response = {
    status,
    data,
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  }
  return new AxiosError('fail', 'ERR', undefined, undefined, response as AxiosResponse)
}

describe('catalogService.remove', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls DELETE /api/catalog/{id}', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({ data: { mensaje: 'ok' } })

    await catalogService.remove('71fdaafa-9022-44e3-b3d0-08d303afe10a')

    expect(apiClient.delete).toHaveBeenCalledWith(
      '/api/catalog/71fdaafa-9022-44e3-b3d0-08d303afe10a',
    )
  })

  it.each([
    [403, 'Acceso denegado'],
    [500, 'Error interno'],
  ])('propagates backend errors (%s)', async (status, message) => {
    vi.mocked(apiClient.delete).mockRejectedValue(httpError(status, { error: message }))

    await expect(catalogService.remove('x')).rejects.toMatchObject({ response: { status } })
  })
})

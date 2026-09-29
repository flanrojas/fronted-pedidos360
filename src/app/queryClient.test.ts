import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { shouldRetryQuery } from './queryClient'

function httpError(status: number) {
  const response = {
    status,
    data: {},
    statusText: '',
    headers: {},
    config: { headers: new AxiosHeaders() },
  }
  return new AxiosError('fail', 'ERR', undefined, undefined, response as AxiosResponse)
}

describe('shouldRetryQuery', () => {
  it.each([400, 403, 404])('does not retry client errors (%s)', (status) => {
    expect(shouldRetryQuery(0, httpError(status))).toBe(false)
  })

  it('retries server and network errors once', () => {
    expect(shouldRetryQuery(0, httpError(502))).toBe(true)
    expect(shouldRetryQuery(1, httpError(502))).toBe(false)
    expect(shouldRetryQuery(0, new AxiosError('Network Error'))).toBe(true)
    expect(shouldRetryQuery(0, new Error('boom'))).toBe(true)
  })
})

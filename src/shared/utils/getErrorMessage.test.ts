import { AxiosError, AxiosHeaders, type AxiosResponse } from 'axios'
import { getErrorMessage } from './getErrorMessage'

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

describe('getErrorMessage', () => {
  it('shows the backend message with the status', () => {
    expect(getErrorMessage(httpError(403, { error: 'Acceso denegado' }))).toBe(
      'Acceso denegado (403)',
    )
    expect(getErrorMessage(httpError(502, { message: 'Internal server error' }))).toBe(
      'Internal server error (502)',
    )
  })

  it('falls back to generic messages when the body has none', () => {
    expect(getErrorMessage(httpError(500, 'boom'))).toBe('Error del servidor (500)')
    expect(getErrorMessage(httpError(404, {}))).toBe('El recurso solicitado no existe')
    expect(getErrorMessage(httpError(404, { error: 'Pedido no encontrado' }))).toBe(
      'Pedido no encontrado',
    )
  })

  it('explains connection errors', () => {
    const offline = new AxiosError('Network Error')
    expect(getErrorMessage(offline)).toMatch(/No se pudo conectar con el backend/)
  })

  it('uses domain error messages and the fallback', () => {
    expect(getErrorMessage(new Error('Stock insuficiente'))).toBe('Stock insuficiente')
    expect(getErrorMessage('x')).toBe('Ocurrió un error inesperado')
  })
})

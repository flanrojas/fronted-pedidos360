import { fitWithin, resizeImageFile } from './resizeImage'

describe('fitWithin', () => {
  it('scales landscape images by their width', () => {
    expect(fitWithin({ width: 1200, height: 800 }, 600)).toEqual({ width: 600, height: 400 })
  })

  it('scales portrait images by their height', () => {
    expect(fitWithin({ width: 900, height: 1800 }, 600)).toEqual({ width: 300, height: 600 })
  })

  it('never upscales small images', () => {
    expect(fitWithin({ width: 320, height: 240 }, 600)).toEqual({ width: 320, height: 240 })
  })

  it('keeps at least 1px per side', () => {
    expect(fitWithin({ width: 10000, height: 1 }, 600)).toEqual({ width: 600, height: 1 })
  })
})

describe('resizeImageFile', () => {
  it('rejects unsupported formats', async () => {
    const file = new File(['gif'], 'foto.gif', { type: 'image/gif' })
    await expect(resizeImageFile(file)).rejects.toThrow('Formato no soportado')
  })

  it('rejects files over 5 MB', async () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'grande.jpg', {
      type: 'image/jpeg',
    })
    await expect(resizeImageFile(file)).rejects.toThrow('más de 5 MB')
  })
})

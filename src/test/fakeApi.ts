import type { Product } from '@/features/catalog/types'
import type { Order } from '@/features/orders/types'
import { apiClient } from '@/shared/api/apiClient'

export interface FakeDb {
  products: Product[]
  orders: Order[]
}

type Collection = keyof FakeDb

function parse(url: string): { collection: Collection; id: number } {
  const match = /^\/(products|orders)\/(\d+)$/.exec(url)
  if (!match) throw new Error(`fakeApi: URL no soportada ${url}`)
  return { collection: match[1] as Collection, id: Number(match[2]) }
}

function find(db: FakeDb, url: string) {
  const { collection, id } = parse(url)
  const record = db[collection].find((r) => r.id === id)
  if (!record) throw Object.assign(new Error('Not found'), { response: { status: 404 } })
  return record
}

/**
 * Wires the mocked `apiClient` (vi.mock('@/shared/api/apiClient')) to an in-memory db,
 * so tests can assert the resulting state. Returns the db for inspection.
 */
export function installFakeApi(initial: FakeDb): FakeDb {
  const db: FakeDb = structuredClone(initial)

  vi.mocked(apiClient.get).mockImplementation((async (url: string) => ({
    data: structuredClone(find(db, url)),
  })) as unknown as typeof apiClient.get)

  vi.mocked(apiClient.patch).mockImplementation((async (url: string, body: object) => {
    const record = find(db, url)
    Object.assign(record, structuredClone(body))
    return { data: structuredClone(record) }
  }) as unknown as typeof apiClient.patch)

  return db
}

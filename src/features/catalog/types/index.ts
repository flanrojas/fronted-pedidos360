export interface Product {
  id: number
  sku: string
  name: string
  description: string
  /** Price in CLP (integer). */
  price: number
  stock: number
  active: boolean
  /** Product photo: http(s) URL, app path or data URL. Empty or missing = no photo. */
  imageUrl?: string
}

export type NewProduct = Omit<Product, 'id'>

/** Editable fields of an existing product. Stock and active status have their own actions. */
export type ProductUpdate = Pick<Product, 'sku' | 'name' | 'description' | 'price' | 'imageUrl'>

export type ProductStatusFilter = 'all' | 'active' | 'inactive'

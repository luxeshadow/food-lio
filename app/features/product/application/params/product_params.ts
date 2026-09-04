export type CreateProductParams = {
  categoryId: number
  name: string
  description?: string | null
  imagePath?: string | null
  price?: number | null
  currency?: string | null
  isAvailable?: boolean
}

export type UpdateProductParams = Partial<CreateProductParams>

export type ProductFilters = {
  availableOnly?: boolean
  category?: string
  dayOfWeek?: number
  period?: string
}

export type GetProductParams = { id: number }
export type UpdateProductRequest = { id: number, values: UpdateProductParams, complete?: boolean }

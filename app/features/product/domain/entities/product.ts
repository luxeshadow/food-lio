export type ProductCategory = {
  id: number
  name: string
  slug: string
}

export type Product = {
  menuItemType?: 'repas' | 'dessert'
  id: number
  categoryId: number
  category?: ProductCategory
  name: string
  description: string | null
  imagePath: string | null
  price: number | null
  currency: string | null
  isAvailable: boolean
  createdAt: string
  updatedAt: string
}

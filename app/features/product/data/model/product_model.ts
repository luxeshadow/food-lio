import type { Product } from '../../domain/entities/product'

export type ProductModel = {
  menu_item_type?: 'repas' | 'dessert'
  id: number
  category_id: number
  category?: Product['category']
  name: string
  description: string | null
  image_path: string | null
  price: number | string | null
  currency: string | null
  is_available: boolean
  created_at: string
  updated_at: string
}

export function toProduct(model: ProductModel): Product {
  return {
    menuItemType: model.menu_item_type,
    id: model.id,
    categoryId: model.category_id,
    category: model.category,
    name: model.name,
    description: model.description,
    imagePath: model.image_path,
    price: model.price === null ? null : Number(model.price),
    currency: model.currency,
    isAvailable: model.is_available,
    createdAt: model.created_at,
    updatedAt: model.updated_at,
  }
}

export function toProductModel(product: Product): ProductModel {
  return {
    id: product.id, category_id: product.categoryId, category: product.category,
    name: product.name, description: product.description, image_path: product.imagePath,
    price: product.price, currency: product.currency, is_available: product.isAvailable,
    created_at: product.createdAt, updated_at: product.updatedAt, menu_item_type: product.menuItemType,
  }
}

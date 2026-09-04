import type { Category } from '../../domain/entities/category'

export type CategoryModel = {
  id: number
  name: string
  slug: string
  display_order: number
}

export function toCategory(model: CategoryModel): Category {
  return {
    id: model.id,
    name: model.name,
    slug: model.slug,
    displayOrder: model.display_order,
  }
}

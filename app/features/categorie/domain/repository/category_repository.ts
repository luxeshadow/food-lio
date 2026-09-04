import type { Category } from '../entities/category'

export interface CategoryRepository {
  getCategories(): Promise<Category[]>
}

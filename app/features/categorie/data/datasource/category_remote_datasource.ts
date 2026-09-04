import type { CategoryModel } from '../model/category_model'

export class CategoryRemoteDatasource {
  getCategories() {
    return $fetch<CategoryModel[]>('/api/categories/get-categories')
  }
}

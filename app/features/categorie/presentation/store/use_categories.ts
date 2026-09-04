import { Failure } from '../../../../core/errors/failure'
import { GetCategories } from '../../application/usecase/get_categories'
import { CategoryRepositoryImpl } from '../../data/repositories/category_repository_impl'
import type { Category } from '../../domain/entities/category'

export function useCategories() {
  const categories = ref<Category[]>([])
  const error = ref('')
  const getCategories = new GetCategories(new CategoryRepositoryImpl())

  async function loadCategories() {
    error.value = ''
    const result = await getCategories.execute()
    if (result instanceof Failure) {
      error.value = 'Impossible de charger les catégories.'
      return
    }
    categories.value = result
  }

  return { categories, error, loadCategories }
}

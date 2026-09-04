import type { Category } from '../../domain/entities/category'
import type { CategoryRepository } from '../../domain/repository/category_repository'
import { CategoryRemoteDatasource } from '../datasource/category_remote_datasource'
import { toCategory } from '../model/category_model'

export class CategoryRepositoryImpl implements CategoryRepository {
  constructor(private readonly datasource = new CategoryRemoteDatasource()) {}

  async getCategories(): Promise<Category[]> {
    const models = await this.datasource.getCategories()
    return models.map(toCategory)
  }
}

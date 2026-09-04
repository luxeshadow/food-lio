import { Failure } from '../../../../core/errors/failure'
import type { UseCase } from '../../../../core/usecase/usecase'
import type { Category } from '../../domain/entities/category'
import type { CategoryRepository } from '../../domain/repository/category_repository'

export class GetCategories implements UseCase<Category[], void> {
  constructor(private readonly repository: CategoryRepository) {}

  async execute(): Promise<Category[] | Failure> {
    try {
      return await this.repository.getCategories()
    } catch (error) {
      return Failure.from(error)
    }
  }
}

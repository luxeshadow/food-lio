import { Failure } from '../../../../core/errors/failure'
import type { UseCase } from '../../../../core/usecase/usecase'
import type { Product } from '../../domain/entities/product'
import type { ProductRepository } from '../../domain/repository/product_repository'
import type { ProductFilters } from '../params/product_params'
import { validateProductFilters } from '../../presentation/validator/product_query_validator'

export class ListProducts implements UseCase<Product[], ProductFilters> {
  constructor(private readonly repository: ProductRepository) {}
  async execute(params: ProductFilters = {}): Promise<Product[] | Failure> {
    const failure = validateProductFilters(params)
    if (failure) return failure
    try { return await this.repository.list(params) }
    catch (error) { return Failure.from(error) }
  }
}

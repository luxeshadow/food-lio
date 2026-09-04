import { Failure } from '../../../../core/errors/failure'
import type { UseCase } from '../../../../core/usecase/usecase'
import type { Product } from '../../domain/entities/product'
import type { ProductRepository } from '../../domain/repository/product_repository'
import type { GetProductParams } from '../params/product_params'
import { validateProductId } from '../../presentation/validator/product_query_validator'

export class GetProduct implements UseCase<Product, GetProductParams> {
  constructor(private readonly repository: ProductRepository) {}
  async execute(params: GetProductParams): Promise<Product | Failure> {
    const failure = validateProductId(params?.id)
    if (failure) return failure
    try { return await this.repository.getById(params.id) }
    catch (error) { return Failure.from(error) }
  }
}

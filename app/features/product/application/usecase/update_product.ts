import { Failure } from '../../../../core/errors/failure'
import type { UseCase } from '../../../../core/usecase/usecase'
import type { Product } from '../../domain/entities/product'
import type { ProductRepository } from '../../domain/repository/product_repository'
import type { UpdateProductRequest } from '../params/product_params'
import { UpdateProductValidator } from '../../presentation/validator/update_product_validator'

export class UpdateProduct implements UseCase<Product, UpdateProductRequest> {
  constructor(private readonly repository: ProductRepository) {}
  async execute(params: UpdateProductRequest): Promise<Product | Failure> {
    const failure = UpdateProductValidator.validate(params)
    if (failure) return failure
    try { return await this.repository.update(params.id, params.values, params.complete) }
    catch (error) { return Failure.from(error) }
  }
}

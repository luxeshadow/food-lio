import { Failure } from '../../../../core/errors/failure'
import type { UseCase } from '../../../../core/usecase/usecase'
import type { Product } from '../../domain/entities/product'
import type { ProductRepository } from '../../domain/repository/product_repository'
import type { CreateProductParams } from '../params/product_params'
import { CreateProductValidator } from '../../presentation/validator/create_product_validator'

export class CreateProduct implements UseCase<Product, CreateProductParams> {
  constructor(private readonly repository: ProductRepository) {}
  async execute(params: CreateProductParams): Promise<Product | Failure> {
    const failure = CreateProductValidator.validate(params)
    if (failure) return failure
    try { return await this.repository.create(params) }
    catch (error) { return Failure.from(error) }
  }
}

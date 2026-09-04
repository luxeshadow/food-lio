import { Failure } from '../../../../core/errors/failure'
import type { UseCase } from '../../../../core/usecase/usecase'
import type { ProductAssociation } from '../../domain/entities/product_association'
import type { ProductRepository } from '../../domain/repository/product_repository'
import type { AssociateProductParams } from '../params/product_association_params'
import { AssociateProductValidator } from '../../presentation/validator/associate_product_validator'

export class AssociateProduct implements UseCase<ProductAssociation, AssociateProductParams> {
  constructor(private readonly repository: ProductRepository) {}
  async execute(params: AssociateProductParams): Promise<ProductAssociation | Failure> {
    const failure = AssociateProductValidator.validate(params)
    if (failure) return failure
    try { return await this.repository.associate(params) }
    catch (error) { return Failure.from(error) }
  }
}

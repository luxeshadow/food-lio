import { Failure } from '../../../../core/errors/failure'
import type { UseCase } from '../../../../core/usecase/usecase'
import type { ProductAssociation } from '../../domain/entities/product_association'
import type { ProductRepository } from '../../domain/repository/product_repository'
import type { GetProductAssociationsParams } from '../params/product_association_params'
import { validateProductId } from '../../presentation/validator/product_query_validator'

export class GetProductAssociations implements UseCase<ProductAssociation[], GetProductAssociationsParams> {
  constructor(private readonly repository: ProductRepository) {}
  async execute(params: GetProductAssociationsParams): Promise<ProductAssociation[] | Failure> {
    const failure = validateProductId(params?.productId)
    if (failure) return failure
    try { return await this.repository.getAssociations(params.productId) }
    catch (error) { return Failure.from(error) }
  }
}

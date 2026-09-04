import { Failure } from '../../../../core/errors/failure'
import type { UseCase } from '../../../../core/usecase/usecase'
import type { ProductRepository } from '../../domain/repository/product_repository'
import type { RemoveProductAssociationParams } from '../params/product_association_params'
import { validateProductId } from '../../presentation/validator/product_query_validator'

export class RemoveProductAssociation implements UseCase<void, RemoveProductAssociationParams> {
  constructor(private readonly repository: ProductRepository) {}
  async execute(params: RemoveProductAssociationParams): Promise<void | Failure> {
    const failure = validateProductId(params?.productId)
    if (failure) return failure
    if (!Number.isSafeInteger(params.id) || params.id < 1) return new Failure('Association invalide.', 400)
    try { await this.repository.removeAssociation(params) }
    catch (error) { return Failure.from(error) }
  }
}

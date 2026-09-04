import { Failure } from '../../../../core/errors/failure'
import type { UseCase } from '../../../../core/usecase/usecase'
import type { Period } from '../../domain/entities/product_association'
import type { ProductRepository } from '../../domain/repository/product_repository'

export class GetPeriods implements UseCase<Period[], void> {
  constructor(private readonly repository: ProductRepository) {}
  async execute(): Promise<Period[] | Failure> {
    try { return await this.repository.getPeriods() }
    catch (error) { return Failure.from(error) }
  }
}

import { Failure } from '../../../../core/errors/failure'
import type { AssociateProductParams } from '../../application/params/product_association_params'

export class AssociateProductValidator {
  static validate(params: AssociateProductParams): Failure | null {
    if (!params || !Number.isSafeInteger(params.productId) || params.productId < 1) return new Failure('Choisissez un produit.', 400)
    if (!Number.isInteger(params.dayOfWeek) || params.dayOfWeek < 1 || params.dayOfWeek > 7) return new Failure('Choisissez un jour entre lundi et dimanche.', 400)
    if (!Number.isSafeInteger(params.periodId) || params.periodId < 1) return new Failure('Choisissez une période.', 400)
    if (!['repas', 'dessert'].includes(params.itemType)) return new Failure('Choisissez repas ou dessert.', 400)
    return null
  }
}

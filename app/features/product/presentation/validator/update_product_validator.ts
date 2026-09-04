import { Failure } from '../../../../core/errors/failure'
import type { UpdateProductRequest } from '../../application/params/product_params'
import { validateProductFields } from './create_product_validator'

export class UpdateProductValidator {
  static validate(params: UpdateProductRequest): Failure | null {
    if (!params || !Number.isSafeInteger(params.id) || params.id < 1) return new Failure('Produit invalide.', 400)
    if (params.complete !== undefined && typeof params.complete !== 'boolean') return new Failure('Mode de modification invalide.', 400)
    const failure = validateProductFields(params.values, params.complete ?? false)
    if (failure) return failure
    if (!Object.keys(params.values).some(key => ['name', 'categoryId', 'description', 'imagePath', 'price', 'currency', 'isAvailable'].includes(key))) {
      return new Failure('Indiquez au moins un champ à modifier.', 400)
    }
    return null
  }
}

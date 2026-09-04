import { Failure } from '../../../../core/errors/failure'
import type { CreateProductParams, UpdateProductParams } from '../../application/params/product_params'

export function validateProductFields(params: UpdateProductParams, complete: boolean): Failure | null {
  if (!params || typeof params !== 'object' || Array.isArray(params)) return new Failure('Données du produit invalides.', 400)
  if ((complete || params.name !== undefined) && (typeof params.name !== 'string' || !params.name.trim() || params.name.trim().length > 160)) {
    return new Failure('Le nom est obligatoire (160 caractères maximum).', 400)
  }
  if ((complete || params.categoryId !== undefined) && (!Number.isSafeInteger(params.categoryId) || Number(params.categoryId) < 1)) {
    return new Failure('Choisissez une catégorie.', 400)
  }
  if (params.description != null && (typeof params.description !== 'string' || params.description.length > 3000)) {
    return new Failure('La description doit contenir au maximum 3 000 caractères.', 400)
  }
  if (params.price != null && (typeof params.price !== 'number' || !Number.isFinite(params.price) || params.price < 0 || params.price > 99999999.99 || Math.abs(params.price * 100 - Math.round(params.price * 100)) > 0.000001)) {
    return new Failure('Le prix doit être positif ou nul, avec au maximum deux décimales.', 400)
  }
  if (params.currency != null && (typeof params.currency !== 'string' || !/^[a-z]{3}$/i.test(params.currency.trim()))) {
    return new Failure('La devise doit avoir trois lettres, par exemple CAD, EUR ou XOF.', 400)
  }
  if (params.imagePath != null && (typeof params.imagePath !== 'string' || !params.imagePath.trim() || /^(?!https?:)[a-z][a-z\d+.-]*:/i.test(params.imagePath.trim()) || params.imagePath.trim().startsWith('//'))) {
    return new Failure('Indiquez une URL http(s) ou un chemin d’image Storage.', 400)
  }
  if (params.isAvailable !== undefined && typeof params.isAvailable !== 'boolean') {
    return new Failure('La disponibilité doit être vraie ou fausse.', 400)
  }
  return null
}

export class CreateProductValidator {
  static validate(params: CreateProductParams) { return validateProductFields(params, true) }
}

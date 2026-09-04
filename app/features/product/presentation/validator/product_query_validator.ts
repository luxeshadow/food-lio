import { Failure } from '../../../../core/errors/failure'
import type { ProductFilters } from '../../application/params/product_params'

export function validateProductId(id: number): Failure | null {
  return Number.isSafeInteger(id) && id > 0 ? null : new Failure('Identifiant du produit invalide.', 400)
}

export function validateProductFilters(params: ProductFilters): Failure | null {
  if (!params || typeof params !== 'object' || Array.isArray(params)) return new Failure('Filtres invalides.', 400)
  if (params.availableOnly !== undefined && typeof params.availableOnly !== 'boolean') return new Failure('Disponibilité invalide.', 400)
  if (params.category !== undefined && (typeof params.category !== 'string' || !params.category.trim())) return new Failure('Catégorie invalide.', 400)
  if ((params.dayOfWeek === undefined) !== (params.period === undefined)) return new Failure('Choisissez un jour et une période.', 400)
  if (params.dayOfWeek !== undefined && (!Number.isInteger(params.dayOfWeek) || params.dayOfWeek < 1 || params.dayOfWeek > 7)) return new Failure('Jour invalide.', 400)
  if (params.period !== undefined && (typeof params.period !== 'string' || !params.period.trim() || /[%_]/.test(params.period))) return new Failure('Période invalide.', 400)
  return null
}

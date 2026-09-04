import { ProductRepositoryImpl } from '../../../app/features/product/data/repositories/product_repository_impl'
import { ProductSupabaseDatasource } from '../../../app/features/product/data/datasource/product_supabase_datasource'
import { Failure } from '../../../app/core/errors/failure'
import { ListProducts } from '../../../app/features/product/application/usecase/list_products'
import { toProductModel } from '../../../app/features/product/data/model/product_model'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  if (query.availableOnly !== undefined && !['true', 'false'].includes(String(query.availableOnly))) throw createError({ statusCode: 400, message: 'Disponibilité invalide' })
  const params = {
    category: query.category === undefined ? undefined : String(query.category),
    dayOfWeek: query.dayOfWeek === undefined ? undefined : Number(query.dayOfWeek),
    period: query.period === undefined ? undefined : String(query.period),
    availableOnly: query.availableOnly === undefined ? undefined : query.availableOnly === 'true',
  }
  const supabase = serverSupabase(event)
  const repository = new ProductRepositoryImpl(new ProductSupabaseDatasource(supabase))
  const result = await new ListProducts(repository).execute(params)
  if (result instanceof Failure) throw createError({ statusCode: result.statusCode, message: result.message })
  return result.map(toProductModel)
})

import { ProductRepositoryImpl } from '../../../app/features/product/data/repositories/product_repository_impl'
import { ProductSupabaseDatasource } from '../../../app/features/product/data/datasource/product_supabase_datasource'
import { Failure } from '../../../app/core/errors/failure'
import { GetPeriods } from '../../../app/features/product/application/usecase/get_periods'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabase(event)
  const repository = new ProductRepositoryImpl(new ProductSupabaseDatasource(supabase))
  const result = await new GetPeriods(repository).execute()
  if (result instanceof Failure) throw createError({ statusCode: result.statusCode, message: result.message })
  return result
})

import { ProductRepositoryImpl } from '../../../app/features/product/data/repositories/product_repository_impl'
import { ProductSupabaseDatasource } from '../../../app/features/product/data/datasource/product_supabase_datasource'
import { Failure } from '../../../app/core/errors/failure'
import { UpdateProduct } from '../../../app/features/product/application/usecase/update_product'
import { toProductModel } from '../../../app/features/product/data/model/product_model'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabase(event)
  const repository = new ProductRepositoryImpl(new ProductSupabaseDatasource(supabase))
  const result = await new UpdateProduct(repository).execute({ id: Number(getQuery(event).id), values: await readBody(event), complete: false })
  if (result instanceof Failure) throw createError({ statusCode: result.statusCode, message: result.message })
  return toProductModel(result)
})

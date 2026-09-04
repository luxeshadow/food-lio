import { ProductRepositoryImpl } from '../../../app/features/product/data/repositories/product_repository_impl'
import { ProductSupabaseDatasource } from '../../../app/features/product/data/datasource/product_supabase_datasource'
import { Failure } from '../../../app/core/errors/failure'
import { RemoveProductAssociation } from '../../../app/features/product/application/usecase/remove_product_association'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabase(event)
  const repository = new ProductRepositoryImpl(new ProductSupabaseDatasource(supabase))
  const result = await new RemoveProductAssociation(repository).execute(await readBody(event))
  if (result instanceof Failure) throw createError({ statusCode: result.statusCode, message: result.message })
  setResponseStatus(event, 204)
  return null
})

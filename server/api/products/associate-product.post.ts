import { ProductRepositoryImpl } from '../../../app/features/product/data/repositories/product_repository_impl'
import { ProductSupabaseDatasource } from '../../../app/features/product/data/datasource/product_supabase_datasource'
import { Failure } from '../../../app/core/errors/failure'
import { AssociateProduct } from '../../../app/features/product/application/usecase/associate_product'
import { toProductAssociationModel } from '../../../app/features/product/data/model/product_association_model'

export default defineEventHandler(async (event) => {
  const supabase = serverSupabase(event)
  const repository = new ProductRepositoryImpl(new ProductSupabaseDatasource(supabase))
  const result = await new AssociateProduct(repository).execute(await readBody(event))
  if (result instanceof Failure) throw createError({ statusCode: result.statusCode, message: result.message })
  return toProductAssociationModel(result)
})

import { ProductRepositoryImpl } from '../../data/repositories/product_repository_impl'
import { ProductRemoteDatasource } from '../../data/datasource/product_remote_datasource'

export function useProductRepository() {
  return new ProductRepositoryImpl(new ProductRemoteDatasource())
}

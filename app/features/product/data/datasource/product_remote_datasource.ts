import type { CreateProductParams, ProductFilters, UpdateProductParams } from '../../application/params/product_params'
import type { ProductModel } from '../model/product_model'
import type { ProductDatasource } from './product_datasource'
import type { AssociateProductParams, RemoveProductAssociationParams } from '../../application/params/product_association_params'
import type { PeriodModel, ProductAssociationModel } from '../model/product_association_model'

export class ProductRemoteDatasource implements ProductDatasource {
  list(filters: ProductFilters = {}) {
    return $fetch<ProductModel[]>('/api/products/get-products', { query: filters })
  }

  getById(id: number) {
    return $fetch<ProductModel>('/api/products/get-product', { query: { id } })
  }

  create(params: CreateProductParams) {
    return $fetch<ProductModel>('/api/products/create-product', { method: 'POST', body: params })
  }

  async update(id: number, params: UpdateProductParams, complete = false) {
    const route = complete
      ? '/api/products/replace-product'
      : '/api/products/update-product'

    return $fetch<ProductModel>(route, {
      method: complete ? 'PUT' : 'PATCH',
      query: { id },
      body: params,
    })
  }

  getPeriods() { return $fetch<PeriodModel[]>('/api/products/get-periods') }

  getAssociations(productId: number) {
    return $fetch<ProductAssociationModel[]>('/api/products/get-product-menus', { query: { productId } })
  }

  associate(params: AssociateProductParams) {
    return $fetch<ProductAssociationModel>('/api/products/associate-product', { method: 'POST', body: params })
  }

  async removeAssociation(params: RemoveProductAssociationParams) {
    await $fetch('/api/products/remove-product-menu', { method: 'DELETE', body: params })
  }
}

import type { CreateProductParams, ProductFilters, UpdateProductParams } from '../../application/params/product_params'
import type { AssociateProductParams, RemoveProductAssociationParams } from '../../application/params/product_association_params'
import type { ProductModel } from '../model/product_model'
import type { PeriodModel, ProductAssociationModel } from '../model/product_association_model'

export interface ProductDatasource {
  list(filters?: ProductFilters): Promise<ProductModel[]>
  getById(id: number): Promise<ProductModel>
  create(params: CreateProductParams): Promise<ProductModel>
  update(id: number, params: UpdateProductParams, complete?: boolean): Promise<ProductModel>
  getPeriods(): Promise<PeriodModel[]>
  getAssociations(productId: number): Promise<ProductAssociationModel[]>
  associate(params: AssociateProductParams): Promise<ProductAssociationModel>
  removeAssociation(params: RemoveProductAssociationParams): Promise<void>
}

import type { CreateProductParams, ProductFilters, UpdateProductParams } from '../../application/params/product_params'
import type { Product } from '../entities/product'
import type { Period, ProductAssociation } from '../entities/product_association'
import type { AssociateProductParams, RemoveProductAssociationParams } from '../../application/params/product_association_params'

export interface ProductRepository {
  list(filters?: ProductFilters): Promise<Product[]>
  getById(id: number): Promise<Product>
  create(params: CreateProductParams): Promise<Product>
  update(id: number, params: UpdateProductParams, complete?: boolean): Promise<Product>
  getPeriods(): Promise<Period[]>
  getAssociations(productId: number): Promise<ProductAssociation[]>
  associate(params: AssociateProductParams): Promise<ProductAssociation>
  removeAssociation(params: RemoveProductAssociationParams): Promise<void>
}

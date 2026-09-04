import type { CreateProductParams, ProductFilters, UpdateProductParams } from '../../application/params/product_params'
import type { Product } from '../../domain/entities/product'
import type { ProductRepository } from '../../domain/repository/product_repository'
import { ProductRemoteDatasource } from '../datasource/product_remote_datasource'
import { toProduct } from '../model/product_model'
import type { ProductDatasource } from '../datasource/product_datasource'
import type { AssociateProductParams, RemoveProductAssociationParams } from '../../application/params/product_association_params'
import { toProductAssociation } from '../model/product_association_model'

export class ProductRepositoryImpl implements ProductRepository {
  constructor(private readonly datasource: ProductDatasource = new ProductRemoteDatasource()) {}

  async list(filters?: ProductFilters): Promise<Product[]> {
    return (await this.datasource.list(filters)).map(toProduct)
  }

  async getById(id: number): Promise<Product> {
    return toProduct(await this.datasource.getById(id))
  }

  async create(params: CreateProductParams): Promise<Product> {
    return toProduct(await this.datasource.create(params))
  }

  async update(id: number, params: UpdateProductParams, complete = false): Promise<Product> {
    return toProduct(await this.datasource.update(id, params, complete))
  }

  async getPeriods() { return this.datasource.getPeriods() }

  async getAssociations(productId: number) {
    return (await this.datasource.getAssociations(productId)).map(toProductAssociation)
  }

  async associate(params: AssociateProductParams) {
    return toProductAssociation(await this.datasource.associate(params))
  }

  async removeAssociation(params: RemoveProductAssociationParams) { await this.datasource.removeAssociation(params) }
}

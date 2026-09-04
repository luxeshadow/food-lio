import type { SupabaseClient } from '@supabase/supabase-js'
import { Failure } from '../../../../core/errors/failure'
import type { ProductDatasource } from './product_datasource'
import type { CreateProductParams, ProductFilters, UpdateProductParams } from '../../application/params/product_params'
import type { AssociateProductParams, RemoveProductAssociationParams } from '../../application/params/product_association_params'
import type { ProductModel } from '../model/product_model'
import type { PeriodModel, ProductAssociationModel } from '../model/product_association_model'

const productColumns = '*, category:categories!inner(id,name,slug)'
const associationColumns = 'id,product_id,item_type,daily_menu:daily_menus(day_of_week,period_id,period:periods(id,name))'

// Toutes les requêtes aux tables Supabase du produit sont ici.
export class ProductSupabaseDatasource implements ProductDatasource {
  constructor(private readonly supabase: SupabaseClient) {}

  private failure(error: { code?: string, message: string }) {
    if (error.code === '42501') return new Failure('Votre compte ne dispose pas des droits nécessaires.', 403)
    if (error.code === '23505') return new Failure('Un produit portant ce nom existe déjà.', 409)
    if (error.code === '23503') return new Failure('Le produit, la catégorie ou la période sélectionnée n’existe plus.', 400)
    if (error.code === 'PGRST116') return new Failure('Élément introuvable.', 404)
    return new Failure(error.message, 500)
  }

  async list(filters: ProductFilters = {}): Promise<ProductModel[]> {
    let menuItems: { product_id: number, item_type: 'repas' | 'dessert' }[] | undefined
    if (filters.dayOfWeek !== undefined && filters.period !== undefined) {
      const { data: period, error: periodError } = await this.supabase.from('periods')
        .select('id').eq('is_active', true).ilike('name', filters.period).maybeSingle()
      if (periodError) throw this.failure(periodError)
      if (!period) return []
      const { data: menu, error: menuError } = await this.supabase.from('daily_menus')
        .select('id').eq('day_of_week', filters.dayOfWeek).eq('period_id', period.id).eq('is_active', true).maybeSingle()
      if (menuError) throw this.failure(menuError)
      if (!menu) return []
      const { data: items, error: itemsError } = await this.supabase.from('daily_menu_items')
        .select('product_id,item_type').eq('daily_menu_id', menu.id).order('display_order').order('id')
      if (itemsError) throw this.failure(itemsError)
      if (!items.length) return []
      menuItems = items
    }
    let query = this.supabase.from('products').select(productColumns)
    if (filters.availableOnly !== false) query = query.eq('is_available', true).eq('category.is_active', true)
    if (filters.category) query = query.eq('category.slug', filters.category)
    if (menuItems) query = query.in('id', menuItems.map(item => item.product_id))
    const { data, error } = await query.order('name').returns<ProductModel[]>()
    if (error) throw this.failure(error)
    if (!menuItems) return data
    return menuItems.flatMap(item => {
      const product = data.find(product => product.id === item.product_id)
      return product ? [{ ...product, menu_item_type: item.item_type }] : []
    })
  }

  async getById(id: number): Promise<ProductModel> {
    const { data, error } = await this.supabase.from('products').select(productColumns)
      .eq('id', id).returns<ProductModel[]>().single()
    if (error) throw this.failure(error)
    return data
  }

  async create(params: CreateProductParams): Promise<ProductModel> {
    const { data, error } = await this.supabase.from('products').insert({
      name: params.name.trim(), category_id: params.categoryId,
      description: params.description?.trim() || null,
      image_path: params.imagePath?.trim() || null,
      price: params.price ?? null, currency: params.currency?.trim().toUpperCase() || null,
      is_available: params.isAvailable ?? true,
    }).select(productColumns).returns<ProductModel[]>().single()
    if (error) throw this.failure(error)
    return data
  }

  async update(id: number, params: UpdateProductParams, complete = false): Promise<ProductModel> {
    // PATCH conserve les champs absents ; PUT remet les champs facultatifs à leur valeur par défaut.
    const values: Record<string, unknown> = complete
      ? { description: null, image_path: null, price: null, currency: null, is_available: true }
      : {}
    if (params.name !== undefined) values.name = params.name.trim()
    if (params.categoryId !== undefined) values.category_id = params.categoryId
    if (params.description !== undefined) values.description = params.description?.trim() || null
    if (params.imagePath !== undefined) values.image_path = params.imagePath?.trim() || null
    if (params.price !== undefined) values.price = params.price
    if (params.currency !== undefined) values.currency = params.currency?.trim().toUpperCase() || null
    if (params.isAvailable !== undefined) values.is_available = params.isAvailable
    values.updated_at = new Date().toISOString()
    const { data, error } = await this.supabase.from('products').update(values).eq('id', id)
      .select(productColumns).returns<ProductModel[]>().single()
    if (error) throw this.failure(error)
    return data
  }

  async getPeriods(): Promise<PeriodModel[]> {
    const { data, error } = await this.supabase.from('periods').select('id,name')
      .eq('is_active', true).order('display_order').order('id')
    if (error) throw this.failure(error)
    return data
  }

  async getAssociations(productId: number): Promise<ProductAssociationModel[]> {
    const { data, error } = await this.supabase.from('daily_menu_items').select(associationColumns)
      .eq('product_id', productId).order('id').returns<ProductAssociationModel[]>()
    if (error) throw this.failure(error)
    return data
  }

  async associate(params: AssociateProductParams): Promise<ProductAssociationModel> {
    const { data: menu, error: menuError } = await this.supabase.from('daily_menus')
      .upsert({ day_of_week: params.dayOfWeek, period_id: params.periodId, is_active: true }, { onConflict: 'day_of_week,period_id' })
      .select('id').single()
    if (menuError) throw this.failure(menuError)
    // Un même produit ne peut apparaître qu'une fois dans ce menu.
    const { data, error } = await this.supabase.from('daily_menu_items').upsert({
      daily_menu_id: menu.id, product_id: params.productId, item_type: params.itemType,
    }, { onConflict: 'daily_menu_id,product_id' }).select(associationColumns).returns<ProductAssociationModel[]>().single()
    if (error) throw this.failure(error)
    return data
  }

  async removeAssociation(params: RemoveProductAssociationParams): Promise<void> {
    const { error } = await this.supabase.from('daily_menu_items').delete().eq('id', params.id).eq('product_id', params.productId)
    if (error) throw this.failure(error)
  }
}

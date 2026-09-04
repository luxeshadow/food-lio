import type { ProductAssociation } from '../../domain/entities/product_association'

export type PeriodModel = { id: number, name: string }
export type ProductAssociationModel = {
  id: number
  product_id: number
  item_type: 'repas' | 'dessert'
  daily_menu: { day_of_week: number, period_id: number, period: PeriodModel }
}

export function toProductAssociation(model: ProductAssociationModel): ProductAssociation {
  return {
    id: model.id,
    productId: model.product_id,
    dayOfWeek: model.daily_menu.day_of_week,
    periodId: model.daily_menu.period_id,
    periodName: model.daily_menu.period.name,
    itemType: model.item_type,
  }
}

export function toProductAssociationModel(value: ProductAssociation): ProductAssociationModel {
  return {
    id: value.id, product_id: value.productId, item_type: value.itemType,
    daily_menu: { day_of_week: value.dayOfWeek, period_id: value.periodId, period: { id: value.periodId, name: value.periodName } },
  }
}

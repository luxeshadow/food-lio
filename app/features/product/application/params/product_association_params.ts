export type AssociateProductParams = {
  productId: number
  dayOfWeek: number
  periodId: number
  itemType: 'repas' | 'dessert'
}

export type GetProductAssociationsParams = { productId: number }
export type RemoveProductAssociationParams = { id: number, productId: number }

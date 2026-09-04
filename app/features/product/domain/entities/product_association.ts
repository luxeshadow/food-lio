export type Period = { id: number, name: string }

export type ProductAssociation = {
  id: number
  productId: number
  dayOfWeek: number
  periodId: number
  periodName: string
  itemType: 'repas' | 'dessert'
}

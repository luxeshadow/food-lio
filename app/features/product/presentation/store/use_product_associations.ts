import { Failure } from '../../../../core/errors/failure'
import type { Product } from '../../domain/entities/product'
import type { Period, ProductAssociation } from '../../domain/entities/product_association'
import { ListProducts } from '../../application/usecase/list_products'
import { GetPeriods } from '../../application/usecase/get_periods'
import { GetProductAssociations } from '../../application/usecase/get_product_associations'
import { AssociateProduct } from '../../application/usecase/associate_product'
import { RemoveProductAssociation } from '../../application/usecase/remove_product_association'
import { useProductRepository } from './use_product_repository'

export function useProductAssociations() {
  const route = useRoute()
  const repository = useProductRepository()
  const products = ref<Product[]>([])
  const periods = ref<Period[]>([])
  const associations = ref<ProductAssociation[]>([])
  const form = reactive({ productId: 0, dayOfWeek: 1, periodId: 0, itemType: 'repas' as 'repas' | 'dessert' })
  const loading = ref(true)
  const loadingAssociations = ref(false)
  const submitting = ref(false)
  const error = ref('')
  const listError = ref('')
  const choicesError = ref('')
  const success = ref('')
  let requestNumber = 0

  async function loadChoices() {
    loading.value = true
    choicesError.value = ''
    const [productResult, periodResult] = await Promise.all([
      new ListProducts(repository).execute({ availableOnly: false }), new GetPeriods(repository).execute(),
    ])
    loading.value = false
    if (productResult instanceof Failure || periodResult instanceof Failure) {
      choicesError.value = 'Impossible de charger les produits ou les périodes.'
      return
    }
    products.value = productResult
    periods.value = periodResult
    const requestedId = Number(route.query.productId)
    if (!form.productId && products.value.some(product => product.id === requestedId)) form.productId = requestedId
  }

  async function loadAssociations() {
    const currentRequest = ++requestNumber
    associations.value = []
    listError.value = ''
    if (!form.productId) { loadingAssociations.value = false; return }
    loadingAssociations.value = true
    const result = await new GetProductAssociations(repository).execute({ productId: Number(form.productId) })
    if (currentRequest !== requestNumber) return
    loadingAssociations.value = false
    if (result instanceof Failure) { listError.value = result.message; return }
    associations.value = [...result].sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.periodId - b.periodId)
  }

  async function submit() {
    if (submitting.value) return
    submitting.value = true
    error.value = ''
    success.value = ''
    try {
      const result = await new AssociateProduct(repository).execute({
        productId: Number(form.productId), dayOfWeek: Number(form.dayOfWeek), periodId: Number(form.periodId), itemType: form.itemType,
      })
      if (result instanceof Failure) { error.value = result.message; return }
      success.value = 'Association enregistrée.'
      await loadAssociations()
    } finally { submitting.value = false }
  }

  async function remove(association: ProductAssociation) {
    if (submitting.value) return
    submitting.value = true
    error.value = ''
    success.value = ''
    try {
      const result = await new RemoveProductAssociation(repository).execute({ id: association.id, productId: association.productId })
      if (result instanceof Failure) { error.value = result.message; return }
      success.value = 'Association retirée. Le produit reste dans le catalogue.'
      await loadAssociations()
    } finally { submitting.value = false }
  }

  watch(() => form.productId, () => {
    error.value = ''; success.value = ''
    const category = products.value.find(product => product.id === Number(form.productId))?.category?.slug
    form.itemType = category === 'dessert' || category === 'desserts' ? 'dessert' : 'repas'
    void loadAssociations()
  })
  onMounted(loadChoices)
  onBeforeUnmount(() => { requestNumber++ })
  return { products, periods, associations, form, loading, loadingAssociations, submitting, error, listError, choicesError, success, loadChoices, loadAssociations, submit, remove }
}

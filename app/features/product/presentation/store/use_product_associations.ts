import { Failure } from '../../../../core/errors/failure'
import { ListProducts } from '../../application/usecase/list_products'
import { GetPeriods } from '../../application/usecase/get_periods'
import { GetProductAssociations } from '../../application/usecase/get_product_associations'
import { AssociateProduct } from '../../application/usecase/associate_product'
import { RemoveProductAssociation } from '../../application/usecase/remove_product_association'
import { ProductRepositoryImpl } from '../../data/repositories/product_repository_impl'
import type { Product } from '../../domain/entities/product'
import type { Period, ProductAssociation } from '../../domain/entities/product_association'
import type { AssociateProductParams } from '../../application/params/product_association_params'

export function useProductAssociations() {
  const repository = new ProductRepositoryImpl()
  const route = useRoute()
  const products = ref<Product[]>([])
  const periods = ref<Period[]>([])
  const associations = ref<ProductAssociation[]>([])
  const form = reactive<AssociateProductParams>({ productId: 0, dayOfWeek: 1, periodId: 0, itemType: 'repas' })
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
      new ListProducts(repository).execute({ availableOnly: false }),
      new GetPeriods(repository).execute(),
    ])
    loading.value = false
    if (productResult instanceof Failure || periodResult instanceof Failure) {
      choicesError.value = productResult instanceof Failure ? productResult.message : periodResult instanceof Failure ? periodResult.message : ''
      return
    }
    products.value = productResult
    periods.value = periodResult
    if (!form.periodId) form.periodId = periodResult[0]?.id ?? 0
    const requestedProductId = Number(route.query.productId)
    if (!form.productId && products.value.some(product => product.id === requestedProductId)) {
      form.productId = requestedProductId
    }
  }

  async function loadAssociations() {
    const currentRequest = ++requestNumber
    const productId = form.productId
    associations.value = []
    listError.value = ''
    loadingAssociations.value = !!productId
    if (!productId) return
    const result = await new GetProductAssociations(repository).execute({ productId })
    if (currentRequest !== requestNumber) return
    loadingAssociations.value = false
    if (result instanceof Failure) { listError.value = result.message; return }
    associations.value = result
  }

  async function submit() {
    if (submitting.value) return
    submitting.value = true
    error.value = ''
    success.value = ''
    try {
      const result = await new AssociateProduct(repository).execute({ ...form })
      if (result instanceof Failure) { error.value = result.message; return }
      success.value = 'Association enregistrée.'
      await loadAssociations()
    } finally {
      submitting.value = false
    }
  }

  async function remove(association: ProductAssociation) {
    if (submitting.value) return
    submitting.value = true
    error.value = ''
    success.value = ''
    try {
      const result = await new RemoveProductAssociation(repository).execute({ id: association.id, productId: association.productId })
      if (result instanceof Failure) { error.value = result.message; return }
      success.value = 'Association retirée.'
      await loadAssociations()
    } finally {
      submitting.value = false
    }
  }

  watch(() => form.productId, () => {
    error.value = ''
    success.value = ''
    void loadAssociations()
  })
  onMounted(loadChoices)
  onBeforeUnmount(() => { requestNumber++ })

  return { products, periods, associations, form, loading, loadingAssociations, submitting, error, listError, choicesError, success, loadChoices, loadAssociations, submit, remove }
}
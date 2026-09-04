import type { Ref } from 'vue'
import type { Product } from '../../domain/entities/product'
import { ListProducts } from '../../application/usecase/list_products'
import { ProductRepositoryImpl } from '../../data/repositories/product_repository_impl'
import { Failure } from '../../../../core/errors/failure'

export function useMenu(category: Ref<string>) {
  const day = ref(1)
  const period = ref('midi')
  const products = ref<Product[]>([])
  const loading = ref(true)
  const error = ref('')
  const isDailyMenu = computed(() => category.value === 'menu-du-jour')
  const listProducts = new ListProducts(new ProductRepositoryImpl())
  let requestNumber = 0

  async function loadProducts() {
    const currentRequest = ++requestNumber
    loading.value = true
    error.value = ''
    products.value = []
    const result = await listProducts.execute(isDailyMenu.value
      ? { dayOfWeek: day.value, period: period.value }
      : { category: category.value })
    if (currentRequest !== requestNumber) return
    loading.value = false
    if (result instanceof Failure) {
      error.value = 'Impossible de charger les produits. Réessayez dans un instant.'
    } else {
      products.value = result
    }
  }

  function updateProductInStore(updatedProduct: Product) {
    const index = products.value.findIndex(product => product.id === updatedProduct.id)
    if (index === -1) return
    products.value[index] = {
      ...updatedProduct,
      menuItemType: products.value[index].menuItemType,
    }
  }

  onMounted(loadProducts)
  watch([category, day, period], loadProducts)
  onBeforeUnmount(() => { requestNumber++ })
  return { day, period, products, loading, error, isDailyMenu, loadProducts, updateProductInStore }
}

import type { Product } from '../../domain/entities/product'

const products = ref<Product[]>([])
const selectedCategory = ref('nourriture')
const selectedDay = ref(1)
const selectedPeriod = ref('midi')
const productToEdit = ref<Product | null>(null)
const loading = ref(false)
const error = ref('')

function setProducts(value: Product[]) {
  products.value = value
}

function addProduct(product: Product) {
  if (!products.value.some(item => item.id === product.id)) products.value.push(product)
}

function updateProduct(updatedProduct: Product) {
  const index = products.value.findIndex(product => product.id === updatedProduct.id)
  if (index === -1) return
  const currentProduct = products.value[index]
  if (!currentProduct) return
  products.value[index] = {
    ...updatedProduct,
    menuItemType: currentProduct.menuItemType,
  }
  if (productToEdit.value?.id === updatedProduct.id) productToEdit.value = updatedProduct
}

function setSelectedCategory(category: string) {
  selectedCategory.value = category
}

function setSelectedDay(day: number) {
  selectedDay.value = day
}

function setSelectedPeriod(period: string) {
  selectedPeriod.value = period
}

function setProductToEdit(product: Product | null) {
  productToEdit.value = product
}

function setLoading(value: boolean) {
  loading.value = value
}

function setError(message: string) {
  error.value = message
}

export function useProduct() {
  return {
    products,
    selectedCategory,
    selectedDay,
    selectedPeriod,
    productToEdit,
    loading,
    error,
    setProducts,
    addProduct,
    updateProduct,
    setSelectedCategory,
    setSelectedDay,
    setSelectedPeriod,
    setProductToEdit,
    setLoading,
    setError,
  }
}

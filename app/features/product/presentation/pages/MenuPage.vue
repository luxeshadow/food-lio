<script setup lang="ts">
import { useProduct } from '../store/use_product'
import ProductCard from './ProductCard.vue'
import ProductSkeleton from '../../../../core/components/ProductSkeleton.vue'
import { Failure } from '../../../../core/errors/failure'
import { ListProducts } from '../../application/usecase/list_products'
import { ProductRepositoryImpl } from '../../data/repositories/product_repository_impl'

const props = defineProps<{ category: string, categoryName: string }>()
const {
  selectedDay: day,
  selectedPeriod: period,
  selectedCategory,
  products,
  loading,
  error,
  setSelectedCategory,
  setProducts,
  setLoading,
  setError,
} = useProduct()
const isDailyMenu = computed(() => selectedCategory.value === 'menu-du-jour')
const listProducts = new ListProducts(new ProductRepositoryImpl())
let requestNumber = 0

async function loadProducts() {
  const currentRequest = ++requestNumber
  setLoading(true)
  setError('')
  const result = await listProducts.execute(isDailyMenu.value
    ? { dayOfWeek: day.value, period: period.value }
    : { category: selectedCategory.value })
  if (currentRequest !== requestNumber) return
  setLoading(false)
  if (result instanceof Failure) {
    setProducts([])
    setError(result.message)
    return
  }
  setProducts(result)
}

watch(() => props.category, (category) => {
  setSelectedCategory(category)
  void loadProducts()
}, { immediate: true })
watch([day, period], loadProducts)
onBeforeUnmount(() => { requestNumber++ })
const days = [
  { name: 'Lundi', short: 'Lun' }, { name: 'Mardi', short: 'Mar' },
  { name: 'Mercredi', short: 'Mer' }, { name: 'Jeudi', short: 'Jeu' },
  { name: 'Vendredi', short: 'Ven' }, { name: 'Samedi', short: 'Sam' },
  { name: 'Dimanche', short: 'Dim' },
]
const groups = computed(() => [
  { title: 'Plats Principaux', icon: 'https://i.postimg.cc/NM5Gd1Zs/fried-rice.png', products: products.value.filter(product => product.menuItemType === 'repas') },
  { title: 'Desserts du Jour', icon: 'https://i.postimg.cc/PxPfSm0f/gelato.png', products: products.value.filter(product => product.menuItemType === 'dessert') },
])
</script>

<template>
  <main class="max-w-4xl mx-auto px-4 py-8">
    <!-- <div v-if="isDailyMenu" id="day-selector-container" class="mb-6 bg-white p-4 rounded-xl shadow-sm">
      <div class="flex justify-center gap-3 mb-4">
        <button id="period-midi" type="button" class="period-btn px-5 py-2 rounded-full font-semibold text-sm transition-all" :class="{ 'active-period': period === 'midi' }" :aria-pressed="period === 'midi'" @click="period = 'midi'">☀️ Midi (Jour)</button>
        <button id="period-soir" type="button" class="period-btn px-5 py-2 rounded-full font-semibold text-sm transition-all" :class="{ 'active-period': period === 'soir' }" :aria-pressed="period === 'soir'" @click="period = 'soir'">🌙 Soir</button>
      </div>
      <div class="scroll-clean flex gap-2 overflow-x-auto pb-1 justify-start sm:justify-center">
        <button v-for="(item, index) in days" :key="item.name" type="button" class="day-btn bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap" :class="{ 'active-day': day === index + 1 }" :aria-pressed="day === index + 1" @click="day = index + 1">{{ item.short }}</button>
      </div>
    </div> -->

    <section id="product-container" class="mb-12" :aria-busy="loading">
      <h2 class="text-xl font-bold mb-6 animate__animated animate__fadeIn" :class="{ 'text-center': isDailyMenu }" style="color: var(--menu-primary)">
        <template v-if="isDailyMenu">Menu du {{ days[day - 1]?.name }} ({{ period === 'midi' ? '☀️ Midi' : '🌙 Soir' }})</template>
        <template v-else>{{ categoryName }}</template>
      </h2>
      <ProductSkeleton v-if="loading" />
      <div v-else-if="error" role="alert">
        <p class="text-gray-600 mb-2">{{ error }}</p>
        <button type="button" class="underline" @click="loadProducts">Réessayer</button>
      </div>
      <p v-else-if="!products.length" class="text-gray-600">Aucun plat disponible.</p>
      <template v-else-if="isDailyMenu">
        <template v-for="group in groups" :key="group.title">
          <div v-if="group.products.length" class="mb-8">
            <h3 class="text-base font-bold mb-4 flex items-center gap-2 border-b pb-2 text-gray-700">
              <img :src="group.icon" alt="" class="w-6 h-6 object-contain">{{ group.title }}
            </h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <ProductCard v-for="product in group.products" :key="product.id" :product="product" />
            </div>
          </div>
        </template>
      </template>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ProductCard v-for="product in products" :key="product.id" :product="product" />
      </div>
    </section>

  </main>

  <footer class="text-center py-6 text-sm text-gray-500 mt-12 animate__animated animate__fadeInUp">© 2026 RAN Restaurant. Tous droits réservés.</footer>
</template>

<style scoped>
.scroll-clean { scrollbar-width: none; -ms-overflow-style: none; }
.scroll-clean::-webkit-scrollbar { display: none; }
.active-day { background-color: var(--menu-primary) !important; color: var(--menu-white) !important; }
.period-btn { background-color: var(--menu-period-background); color: var(--menu-period-text); border: none; transition: all .3s ease; }
.active-period { color: var(--menu-white) !important; background-color: var(--menu-primary) !important; box-shadow: 0 4px 12px var(--menu-primary-shadow); }
</style>

<script setup lang="ts">
import { AppAsset } from '../../../../core/constants/app_asset'
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
})
onMounted(() => {
  setSelectedCategory(props.category)
  void loadProducts()
})
watch([day, period], () => {
  if (isDailyMenu.value) void loadProducts()
})
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
    <div v-if="isDailyMenu" id="day-selector-container" class="menu-selector">
      <div class="selector-top">
        <div class="selector-heading">
          <span class="selector-eyebrow">À LA CARTE DU JOUR</span>
          <p class="selector-title">Quel jour vous fait envie ?</p>
        </div>
        <div class="period-switch" role="group" aria-label="Choisir le service">
          <button id="period-midi" type="button" class="period-btn" :class="{ 'active-period': period === 'midi' }" :aria-pressed="period === 'midi'" @click="period = 'midi'">
            <img :src="AppAsset.morn" alt=""> <span>Midi</span>
          </button>
          <button id="period-soir" type="button" class="period-btn" :class="{ 'active-period': period === 'soir' }" :aria-pressed="period === 'soir'" @click="period = 'soir'">
            <img :src="AppAsset.moon" alt=""> <span>Soir</span>
          </button>
        </div>
      </div>
      <div class="day-list" role="group" aria-label="Choisir le jour">
        <button v-for="(item, index) in days" :key="item.name" type="button" class="day-btn" :class="{ 'active-day': day === index + 1 }" :aria-pressed="day === index + 1" :aria-label="item.name" @click="day = index + 1">
          <span>{{ item.short }}</span>
          <span class="day-indicator" aria-hidden="true"></span>
        </button>
      </div>
    </div>
    <section id="product-container" class="mb-12" :aria-busy="loading">
      <h2 class="text-xl font-bold mb-6 animate__animated animate__fadeIn" :class="{ 'text-center': isDailyMenu }" style="color: var(--menu-primary)">
        <template v-if="isDailyMenu">
          <span class="daily-menu-title">
            <span class="daily-menu-day">Menu du {{ days[day - 1]?.name }}</span>
            <span class="daily-menu-period"><img :src="period === 'midi' ? AppAsset.morn : AppAsset.moon" alt="">{{ period === 'midi' ? 'Midi' : 'Soir' }}</span>
          </span>
        </template>
        <template v-else>{{ categoryName }}</template>
      </h2>
      <ProductSkeleton v-if="loading" />
      <div v-else-if="error" role="alert">
        <p class="text-gray-600 mb-2">{{ error }}</p>
        <button type="button" class="underline" @click="loadProducts">Réessayer</button>
      </div>
      <p v-else-if="!products.length" class="text-gray-600 flex items-center justify-center gap-2" role="status"><i class="fi fi-rr-empty-set" aria-hidden="true"></i> Aucun plat disponible.</p>
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

  <footer class="text-center py-6 text-sm text-gray-500 mt-12 animate__animated animate__fadeInUp">© 2026 Restaurant.</footer>
</template>

<style scoped>
.daily-menu-title { display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 12px; }
.daily-menu-day { color: #29251e; font-size: clamp(20px, 4vw, 25px); line-height: 1.3; }
.daily-menu-period { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid #eae4d8; border-radius: 999px; background: #fffaf0; color: #78633d; font-family: Inter, Arial, sans-serif; font-size: 12px; font-weight: 600; line-height: 1.4; }
.daily-menu-period img { width: 18px; height: 18px; object-fit: contain; }
.menu-selector {
  margin-bottom: 32px;
  padding: 24px;
  border: 1px solid #eae4d8;
  border-radius: 24px;
  background: linear-gradient(135deg, #ffffff, #fffcf5);
  box-shadow: 0 8px 28px rgb(74 55 25 / 5%);
}
.selector-top { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 22px; }
.selector-eyebrow { color: #78633d; font-size: 10px; font-weight: 700; letter-spacing: 1.8px; }
.selector-title { margin: 6px 0 0; color: #29251e; font-size: 18px; font-weight: 600; line-height: 1.4; }
.period-switch { display: flex; flex-shrink: 0; gap: 4px; padding: 5px; border: 1px solid #eae4d8; border-radius: 16px; background: #f3f0e9; }
.period-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 44px; padding: 10px 18px; border: 0; border-radius: 11px; background: transparent; color: #625c51; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .2s, color .2s, box-shadow .2s; }
.period-btn img { width: 22px; height: 22px; object-fit: contain; }
.period-btn.active-period { color: #29251e; background: #fff; box-shadow: 0 2px 8px rgb(74 55 25 / 10%); }
.day-list { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 8px; }
.day-btn { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; min-width: 0; min-height: 65px; padding: 12px 4px 9px; border: 1px solid transparent; border-radius: 14px; color: #6b655b; background: #f5f3ee; font: inherit; font-size: 14px; font-weight: 600; cursor: pointer; transition: background .2s, color .2s, border-color .2s; }
.day-indicator { width: 4px; height: 4px; border-radius: 50%; background: currentColor; opacity: .2; }
.day-btn.active-day { border-color: var(--menu-primary); color: #29251e; background: var(--menu-primary); }
.active-day .day-indicator { opacity: 1; }
@media (hover: hover) {
  .day-btn:not(.active-day):hover { background: #eee7d9; border-color: #ded1b8; }
  .period-btn:not(.active-period):hover { background: #e9e4d9; }
}
.day-btn:focus-visible, .period-btn:focus-visible { outline: 2px solid #78633d; outline-offset: 3px; }
@media (max-width: 540px) {
  .menu-selector { padding: 18px 14px; border-radius: 20px; }
  .selector-top { flex-direction: column; align-items: stretch; gap: 16px; margin-bottom: 16px; }
  .selector-heading { text-align: center; }
  .selector-title { font-size: 17px; }
  .period-switch { width: 100%; }
  .period-btn { flex: 1; }
  .day-list { gap: 4px; }
  .day-btn { min-height: 59px; border-radius: 11px; font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .day-btn, .period-btn { transition: none; }
}
</style>
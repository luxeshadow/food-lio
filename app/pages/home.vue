<script setup lang="ts">
import { definePageMeta } from '#imports'
import Header from '../core/components/Header.vue'
import MenuPage from '../features/product/presentation/pages/MenuPage.vue'
import { useCategories } from '../features/categorie/presentation/store/use_categories'
import SearchButton from '../core/components/SearchButton.vue'

definePageMeta({ alias: ['/'] })
const selectedCategory = ref('nourriture')
const { categories, error: categoryError, loadCategories } = useCategories()
const categoryName = computed(() => categories.value.find(category => category.slug === selectedCategory.value)?.name ?? '')
async function loadPageCategories() {
  await loadCategories()
  const foodCategory = categories.value.find(category => ['nourriture', 'nouriture'].includes(category.slug))
  if (foodCategory) selectedCategory.value = foodCategory.slug
}
onMounted(loadPageCategories)
</script>

<template>
  <div>
    <Header :categories="categories" :active-category="selectedCategory" @category-change="selectedCategory = $event" />
    <p v-if="categoryError" class="text-center text-gray-600 px-4 pt-4" role="alert">{{ categoryError }} <button type="button" class="underline" @click="loadPageCategories">Réessayer</button></p>
    <MenuPage :category="selectedCategory" :category-name="categoryName" />
    <SearchButton placement="floating" />
  </div>
</template>

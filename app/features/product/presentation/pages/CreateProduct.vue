<script setup lang="ts">
import { useProduct } from '../store/use_product'
import { useCategories } from '../../../categorie/presentation/store/use_categories'
import { Failure } from '../../../../core/errors/failure'
import { useSupabase } from '../../../../core/supabase/supabase'
import { CreateProduct } from '../../application/usecase/create_product'
import { ProductRepositoryImpl } from '../../data/repositories/product_repository_impl'
import type { Product } from '../../domain/entities/product'

const { addProduct } = useProduct()
const form = reactive({ name: '', categoryId: 0, description: '', price: '' as number | '', currency: '', isAvailable: true })
const imageFile = ref<File | null>(null)
const submitting = ref(false)
const error = ref('')
const createdProduct = ref<Product | null>(null)
const createProductUseCase = new CreateProduct(new ProductRepositoryImpl())
const { categories, error: categoryError, loadCategories } = useCategories()
const loadingCategories = ref(true)
async function refreshCategories() { loadingCategories.value = true; await loadCategories(); loadingCategories.value = false }
const selectedCategorySlug = computed(() => categories.value.find(category => category.id === form.categoryId)?.slug ?? '')

function selectImage(event: Event) {
  imageFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
}

async function uploadImage() {
  const file = imageFile.value
  if (!file) return null
  if (!file.type.startsWith('image/')) throw new Error('Choisissez un fichier image.')
  if (file.size > 5 * 1024 * 1024) throw new Error('L’image ne doit pas dépasser 5 Mo.')
  const folders: Record<string, string> = {
    nourriture: 'nouriture', nouriture: 'nouriture', dessert: 'desert', desert: 'desert',
    boisson: 'boisson', 'fruit-de-mer': 'fruit_mere', 'fruits-de-mer': 'fruit_mere', fruit_mere: 'fruit_mere',
  }
  const slug = selectedCategorySlug.value
  const folder = folders[slug] ?? slug.replace(/[^a-z0-9_-]/gi, '_')
  const extension = file.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'webp'
  const path = `${folder}/${crypto.randomUUID()}.${extension}`
  const { error: uploadError } = await useSupabase().storage.from('media').upload(path, file, {
    contentType: file.type,
    upsert: false,
  })
  if (uploadError) throw uploadError
  return path
}

async function submitForm() {
  if (submitting.value) return
  submitting.value = true
  error.value = ''
  createdProduct.value = null
  try {
    const result = await createProductUseCase.execute({
      name: form.name,
      categoryId: Number(form.categoryId),
      description: form.description.trim() || null,
      imagePath: await uploadImage(),
      price: form.price === '' ? null : Number(form.price),
      currency: form.currency.trim() || null,
      isAvailable: form.isAvailable,
    })
    if (result instanceof Failure) { error.value = result.message; return }
    createdProduct.value = result
    addProduct(result)
    Object.assign(form, { name: '', categoryId: 0, description: '', price: '', currency: '', isAvailable: true })
    imageFile.value = null
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Impossible d’enregistrer le produit.'
  } finally {
    submitting.value = false
  }
}
onMounted(refreshCategories)
</script>

<template>
  <main>
    <nav class="flex flex-wrap gap-4 text-sm mb-8" aria-label="Gestion des produits">
      <NuxtLink to="/" class="underline">Voir le menu</NuxtLink>
      <NuxtLink to="/create-product" aria-current="page" class="font-semibold">Créer un produit</NuxtLink>
      <NuxtLink to="/associate-product" class="underline">Associer aux menus</NuxtLink>
    </nav>
    <h1 class="text-3xl font-bold mb-2">Créer un produit</h1>
    <p class="text-gray-600 mb-6">Enregistrez le produit dans sa catégorie. Vous pourrez ensuite le placer dans un ou plusieurs menus.</p>
    <div v-if="createdProduct" class="bg-green-50 border border-green-200 rounded-xl p-4 mb-6" role="status">
      <p>{{ createdProduct.name }} a été enregistré.</p>
      <NuxtLink :to="{ path: '/associate-product', query: { productId: createdProduct.id } }" class="underline font-semibold">Associer ce produit à un menu</NuxtLink>
    </div>
    <form class="bg-white rounded-xl shadow-md p-6" novalidate @submit.prevent="submitForm">
      <fieldset :disabled="submitting" class="space-y-5">
        <div><label for="product-name" class="block font-medium mb-2">Nom *</label><input id="product-name" v-model="form.name" type="text" maxlength="160" class="w-full border rounded-lg px-3 py-2" placeholder="Ravioli" required></div>
        <div>
          <label for="product-category" class="block font-medium mb-2">Catégorie *</label>
          <select id="product-category" v-model.number="form.categoryId" class="w-full border rounded-lg px-3 py-2" :disabled="loadingCategories" required>
            <option :value="0">{{ loadingCategories ? 'Chargement…' : 'Choisir une catégorie' }}</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
          <p v-if="categoryError" class="text-red-600 mt-2" role="alert">{{ categoryError }} <button type="button" class="underline" @click="refreshCategories">Réessayer</button></p>
          <p v-else-if="!loadingCategories && !categories.length" class="text-gray-600 mt-2">Ajoutez d’abord une catégorie dans Supabase.</p>
        </div>
        <div><label for="product-description" class="block font-medium mb-2">Description</label><textarea id="product-description" v-model="form.description" rows="3" maxlength="3000" class="w-full border rounded-lg px-3 py-2"></textarea></div>
        <div>
          <label for="product-image" class="block font-medium mb-2">Image du produit</label>
          <input id="product-image" type="file" accept="image/*" class="w-full border rounded-lg px-3 py-2" @change="selectImage">
          <p class="text-sm text-gray-500 mt-1">PNG, JPG, WEBP… 5 Mo maximum. L’image sera envoyée dans le bucket media.</p>
          <p v-if="imageFile" class="text-sm mt-1">Fichier choisi : {{ imageFile.name }}</p>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label for="product-price" class="block font-medium mb-2">Prix (facultatif)</label><input id="product-price" v-model.number="form.price" type="number" min="0" step="0.01" class="w-full border rounded-lg px-3 py-2"></div>
          <div><label for="product-currency" class="block font-medium mb-2">Devise (facultative)</label><input id="product-currency" v-model="form.currency" type="text" maxlength="3" class="w-full border rounded-lg px-3 py-2 uppercase" placeholder="CAD"></div>
        </div>
        <label class="flex items-center gap-2"><input v-model="form.isAvailable" type="checkbox"> Produit disponible</label>
        <p v-if="error" class="text-red-600" role="alert">{{ error }}</p>
        <button type="submit" class="text-white font-semibold px-6 py-3 rounded-lg disabled:opacity-50" style="background: var(--menu-primary)" :disabled="submitting || loadingCategories || !categories.length">{{ submitting ? 'Enregistrement…' : 'Enregistrer le produit' }}</button>
      </fieldset>
    </form>
  </main>
</template>

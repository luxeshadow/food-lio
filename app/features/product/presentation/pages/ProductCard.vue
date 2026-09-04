<script setup lang="ts">
import type { Product } from '../../domain/entities/product'
import { useUpdateProduct } from '../store/use_update_product'
import { AppColors } from '../../../../core/constants/app_colors'

const props = defineProps<{ product: Product }>()
const emit = defineEmits<{ updated: [product: Product] }>()
const { editing, submitting, error, imageFile, form, open, close, selectImage, submit } = useUpdateProduct(
  toRef(props, 'product'),
  product => emit('updated', product),
)
const config = useRuntimeConfig()
const imageFailed = ref(false)
const imageUrl = computed(() => {
  const path = props.product.imagePath
  if (!path) return ''
  if (/^https?:\/\//i.test(path) || path.startsWith('/')) return path
  const objectPath = path.replace(/^media\//, '').split('/').map(encodeURIComponent).join('/')
  return String(config.public.supabaseUrl).replace(/\/$/, '') + '/storage/v1/object/public/media/' + objectPath
})
watch(imageUrl, () => { imageFailed.value = false })
</script>

<template>
  <div class="relative bg-white p-4 rounded-xl shadow-md hover:shadow-xl transition animate__animated animate__fadeInUp flex flex-col justify-between">
    <button type="button" class="product-edit-button" aria-label="Modifier ce produit" title="Modifier" @click="open">
      <i class="fi fi-rr-pen-circle" aria-hidden="true"></i>
    </button>
    <div>
      <img v-if="imageUrl && !imageFailed" :src="imageUrl" :alt="product.name" class="rounded-lg mb-3 w-full object-contain" @error="imageFailed = true">
      <h3 class="text-lg font-bold mb-1 text-gray-900">{{ product.name }}</h3>
      <p class="text-xs text-gray-500 mb-4 line-clamp-2">{{ product.description }}</p>
    </div>
    <div v-if="product.price !== null" class="flex justify-between items-center pt-2 border-t border-gray-100">
      <span class="font-bold text-base" style="color: var(--menu-primary)">
        <template v-if="product.price !== null">{{ product.price }} {{ product.currency }}</template>
      </span>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="editing" class="product-edit-overlay" @click.self="close">
      <form class="product-edit-form" role="dialog" aria-modal="true" aria-labelledby="product-edit-title" @submit.prevent="submit">
        <div class="flex items-center justify-between gap-4 mb-5">
          <h2 id="product-edit-title" class="text-xl font-bold">Modifier le produit</h2>
          <button type="button" class="product-edit-close" aria-label="Fermer" @click="close">×</button>
        </div>
        <fieldset :disabled="submitting" class="space-y-4">
          <div><label :for="`edit-name-${product.id}`" class="block font-medium mb-1">Nom *</label><input :id="`edit-name-${product.id}`" v-model="form.name" type="text" maxlength="160" required class="w-full border rounded-lg px-3 py-2"></div>
          <div><label :for="`edit-description-${product.id}`" class="block font-medium mb-1">Description</label><textarea :id="`edit-description-${product.id}`" v-model="form.description" rows="3" maxlength="3000" class="w-full border rounded-lg px-3 py-2"></textarea></div>
          <div>
            <label :for="`edit-image-${product.id}`" class="block font-medium mb-1">Remplacer l’image</label>
            <input :id="`edit-image-${product.id}`" type="file" accept="image/*" class="w-full border rounded-lg px-3 py-2" @change="selectImage">
            <p v-if="imageFile" class="text-sm text-gray-600 mt-1">{{ imageFile.name }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label :for="`edit-price-${product.id}`" class="block font-medium mb-1">Prix</label><input :id="`edit-price-${product.id}`" v-model="form.price" type="number" min="0" step="0.01" class="w-full border rounded-lg px-3 py-2"></div>
            <div><label :for="`edit-currency-${product.id}`" class="block font-medium mb-1">Devise</label><input :id="`edit-currency-${product.id}`" v-model="form.currency" type="text" maxlength="3" class="w-full border rounded-lg px-3 py-2 uppercase"></div>
          </div>
          <label class="flex items-center gap-2"><input v-model="form.isAvailable" type="checkbox"> Produit disponible</label>
          <p v-if="error" class="text-red-600" role="alert">{{ error }}</p>
          <div class="product-edit-actions flex justify-end gap-3 pt-2">
            <button type="button" class="px-4 py-2 rounded-lg border" @click="close">Annuler</button>
            <button type="submit" class="product-edit-save px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50" :style="{ backgroundColor: AppColors.primary }" :disabled="submitting">{{ submitting ? 'Modification…' : 'Enregistrer' }}</button>
          </div>
        </fieldset>
      </form>
    </div>
  </Teleport>
</template>

<style scoped>
.line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.product-edit-button { position: absolute; z-index: 2; top: 12px; right: 12px; display: grid; place-items: center; width: 42px; height: 42px; padding: 0; border: 0; color: white; background: transparent; cursor: pointer; }
.product-edit-button i { font-size: 21px; line-height: 1; }
.product-edit-overlay { position: fixed; inset: 0; z-index: 10000; display: grid; place-items: center; padding: 16px; background: rgb(0 0 0 / 55%); }
.product-edit-form { width: min(100%, 520px); max-height: calc(100vh - 32px); overflow-y: auto; padding: 24px; border-radius: 16px; background: white; box-shadow: 0 20px 50px rgb(0 0 0 / 30%); }
.product-edit-close { border: 0; color: #4b5563; background: transparent; font-size: 30px; line-height: 1; cursor: pointer; }
.product-edit-actions { position: sticky; bottom: -24px; z-index: 2; margin: 0 -24px -24px; padding: 16px 24px 24px; background: white; border-top: 1px solid #e5e7eb; }
.product-edit-save { display: inline-flex; align-items: center; justify-content: center; min-width: 120px; border: 0; cursor: pointer; }
</style>

<script setup lang="ts">
import type { Product } from '../../domain/entities/product'
import { useProduct } from '../store/use_product'
import { AppColors } from '../../../../core/constants/app_colors'
import { Failure } from '../../../../core/errors/failure'
import { useToast } from '../../../../core/shared/use_toast'
import { useSupabase } from '../../../../core/supabase/supabase'
import { UpdateProduct } from '../../application/usecase/update_product'
import { ProductRepositoryImpl } from '../../data/repositories/product_repository_impl'

const props = defineProps<{ product: Product }>()
const { productToEdit, setProductToEdit, updateProduct } = useProduct()
const editing = computed(() => productToEdit.value?.id === props.product.id)
const submitting = ref(false)
const error = ref('')
const imageFile = ref<File | null>(null)
const imagePreview = ref('')
const form = reactive({ name: '', description: '', price: '' as number | '', currency: '', isAvailable: true })
const updateProductUseCase = new UpdateProduct(new ProductRepositoryImpl())
const { showToast } = useToast()
let previewUrl = ''

function clearImagePreview() {
  if (previewUrl) URL.revokeObjectURL(previewUrl)
  previewUrl = ''
  imagePreview.value = ''
}

function open() {
  Object.assign(form, {
    name: props.product.name,
    description: props.product.description ?? '',
    price: props.product.price ?? '',
    currency: props.product.currency ?? '',
    isAvailable: props.product.isAvailable,
  })
  imageFile.value = null
  clearImagePreview()
  error.value = ''
  setProductToEdit(props.product)
}

function close() {
  if (submitting.value) return
  setProductToEdit(null)
  clearImagePreview()
}

function selectImage(event: Event) {
  imageFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
  clearImagePreview()
  if (!imageFile.value) return
  previewUrl = URL.createObjectURL(imageFile.value)
  imagePreview.value = previewUrl
}

async function uploadImage() {
  const file = imageFile.value
  if (!file) return props.product.imagePath
  if (!file.type.startsWith('image/')) throw new Error('Choisissez un fichier image.')
  if (file.size > 5 * 1024 * 1024) throw new Error('L’image ne doit pas dépasser 5 Mo.')
  const folders: Record<string, string> = {
    nourriture: 'nouriture', nouriture: 'nouriture', dessert: 'desert', desert: 'desert',
    boisson: 'boisson', 'fruit-de-mer': 'fruit_mere', 'fruits-de-mer': 'fruit_mere', fruit_mere: 'fruit_mere',
  }
  const slug = props.product.category?.slug ?? 'produits'
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

async function submit() {
  if (submitting.value) return
  submitting.value = true
  error.value = ''
  try {
    const result = await updateProductUseCase.execute({
      id: props.product.id,
      values: {
        name: form.name,
        description: form.description.trim() || null,
        imagePath: await uploadImage(),
        price: form.price === '' ? null : Number(form.price),
        currency: form.currency.trim() || null,
        isAvailable: form.isAvailable,
      },
    })
    if (result instanceof Failure) {
      error.value = result.message
      showToast(result.message, 'fi-rr-cross-circle', 'error')
      return
    }
    updateProduct(result)
    setProductToEdit(null)
    clearImagePreview()
    showToast('Produit modifié avec succès.', 'fi-rr-check-circle', 'success')
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : 'Impossible de modifier le produit.'
    showToast(error.value, 'fi-rr-cross-circle', 'error')
  } finally {
    submitting.value = false
  }
}

onBeforeUnmount(clearImagePreview)
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
          <h2 id="product-edit-title" class="text-xl font-bold flex items-center gap-2"> Modifier le produit</h2>
          <button type="button" class="product-edit-close" aria-label="Fermer" @click="close">×</button>
        </div>
        <fieldset :disabled="submitting" class="space-y-4">
          <div><label :for="`edit-name-${product.id}`" class="product-field-label"><i class="fi fi-rr-text"></i> Nom *</label><input :id="`edit-name-${product.id}`" v-model="form.name" type="text" maxlength="160" required class="w-full border rounded-lg px-3 py-2"></div>
          <div><label :for="`edit-description-${product.id}`" class="product-field-label"><i class="fi fi-rr-document"></i> Description</label><textarea :id="`edit-description-${product.id}`" v-model="form.description" rows="3" maxlength="3000" class="w-full border rounded-lg px-3 py-2"></textarea></div>
          <div>
            <span class="product-field-label"><i class="fi fi-rr-picture"></i> Image du produit</span>
            <label :for="`edit-image-${product.id}`" class="product-upload-zone">
              <img v-if="imagePreview || imageUrl" :src="imagePreview || imageUrl" alt="Aperçu du produit" class="product-upload-preview">
              <span class="product-upload-content">
                <i class="fi fi-rr-cloud-upload-alt"></i>
                <strong>{{ imageFile ? 'Changer cette image' : 'Choisir une image' }}</strong>
                <small>PNG, JPG ou WEBP — 5 Mo maximum</small>
              </span>
            </label>
            <input :id="`edit-image-${product.id}`" type="file" accept="image/*" class="product-image-input" @change="selectImage">
            <p v-if="imageFile" class="product-file-name"><i class="fi fi-rr-check-circle"></i> {{ imageFile.name }}</p>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label :for="`edit-price-${product.id}`" class="product-field-label"><i class="fi fi-rr-dollar"></i> Prix</label><input :id="`edit-price-${product.id}`" v-model="form.price" type="number" min="0" step="0.01" class="w-full border rounded-lg px-3 py-2"></div>
            <div><label :for="`edit-currency-${product.id}`" class="product-field-label"><i class="fi fi-rr-coins"></i> Devise</label><input :id="`edit-currency-${product.id}`" v-model="form.currency" type="text" maxlength="3" class="w-full border rounded-lg px-3 py-2 uppercase"></div>
          </div>
          <label class="flex items-center gap-2"><input v-model="form.isAvailable" type="checkbox"> Produit disponible</label>
          <p v-if="error" class="text-red-600" role="alert">{{ error }}</p>
          <div class="product-edit-actions flex justify-end gap-3 pt-2">
            <button type="button" class="px-4 py-2 rounded-lg border flex items-center gap-2" @click="close"><i class="fi fi-rr-cross-small"></i> Annuler</button>
            <button type="submit" class="product-edit-save px-4 py-2 rounded-lg text-white font-semibold disabled:opacity-50" :style="{ backgroundColor: AppColors.primary }" :disabled="submitting"><i class="fi fi-rr-disk"></i> {{ submitting ? 'Modification…' : 'Enregistrer' }}</button>
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
.product-field-label { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; font-weight: 600; }
.product-field-label i { color: #cbab6c; }
.product-image-input { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.product-upload-zone { display: flex; align-items: center; gap: 14px; min-height: 112px; padding: 12px; border: 2px dashed #d1d5db; border-radius: 12px; background: #f9fafb; cursor: pointer; transition: border-color .2s ease, background .2s ease; }
.product-upload-zone:hover { border-color: #cbab6c; background: #fffbf2; }
.product-upload-preview { width: 88px; height: 88px; flex: 0 0 auto; border-radius: 10px; object-fit: cover; }
.product-upload-content { display: flex; min-width: 0; flex-direction: column; align-items: flex-start; gap: 3px; }
.product-upload-content > i { color: #cbab6c; font-size: 26px; }
.product-upload-content small { color: #6b7280; }
.product-file-name { display: flex; align-items: center; gap: 6px; margin-top: 7px; color: #4b5563; font-size: 13px; overflow-wrap: anywhere; }
.product-edit-actions { position: sticky; bottom: -24px; z-index: 2; margin: 0 -24px -24px; padding: 16px 24px 24px; background: white; border-top: 1px solid #e5e7eb; }
.product-edit-save { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-width: 120px; border: 0; cursor: pointer; }
</style>

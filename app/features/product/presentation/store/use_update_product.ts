import type { Ref } from 'vue'
import { Failure } from '../../../../core/errors/failure'
import { useToast } from '../../../../core/shared/use_toast'
import { useSupabase } from '../../../../core/supabase/supabase'
import { UpdateProduct } from '../../application/usecase/update_product'
import type { Product } from '../../domain/entities/product'
import { useProductRepository } from './use_product_repository'

export function useUpdateProduct(product: Ref<Product>, onUpdated: (product: Product) => void) {
  const editing = ref(false)
  const submitting = ref(false)
  const error = ref('')
  const imageFile = ref<File | null>(null)
  const imagePreview = ref('')
  let previewUrl = ''
  const form = reactive({
    name: '',
    description: '',
    price: '' as number | '',
    currency: '',
    isAvailable: true,
  })
  const updateProduct = new UpdateProduct(useProductRepository())
  const { showToast } = useToast()

  function clearImagePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    previewUrl = ''
    imagePreview.value = ''
  }

  function open() {
    Object.assign(form, {
      name: product.value.name,
      description: product.value.description ?? '',
      price: product.value.price ?? '',
      currency: product.value.currency ?? '',
      isAvailable: product.value.isAvailable,
    })
    imageFile.value = null
    clearImagePreview()
    error.value = ''
    editing.value = true
  }

  function close() {
    if (!submitting.value) {
      editing.value = false
      clearImagePreview()
    }
  }

  function selectImage(event: Event) {
    imageFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
    clearImagePreview()
    if (imageFile.value) {
      previewUrl = URL.createObjectURL(imageFile.value)
      imagePreview.value = previewUrl
    }
  }

  async function uploadImage() {
    const file = imageFile.value
    if (!file) return product.value.imagePath
    if (!file.type.startsWith('image/')) throw new Error('Choisissez un fichier image.')
    if (file.size > 5 * 1024 * 1024) throw new Error('L’image ne doit pas dépasser 5 Mo.')

    const slug = product.value.category?.slug ?? 'produits'
    const folders: Record<string, string> = {
      nourriture: 'nouriture', nouriture: 'nouriture', dessert: 'desert', desert: 'desert',
      boisson: 'boisson', 'fruit-de-mer': 'fruit_mere', 'fruits-de-mer': 'fruit_mere', fruit_mere: 'fruit_mere',
    }
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
      const imagePath = await uploadImage()
      const result = await updateProduct.execute({
        id: product.value.id,
        values: {
          name: form.name,
          description: form.description.trim() || null,
          imagePath,
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
      onUpdated(result)
      editing.value = false
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

  return { editing, submitting, error, imageFile, imagePreview, form, open, close, selectImage, submit }
}

import { Failure } from '../../../../core/errors/failure'
import { CreateProduct } from '../../application/usecase/create_product'
import type { Product } from '../../domain/entities/product'
import { useProductRepository } from './use_product_repository'
import { useSupabase } from '../../../../core/supabase/supabase'

export function useCreateProduct() {
  const form = reactive({ name: '', categoryId: 0, description: '', price: '' as number | '', currency: '', isAvailable: true })
  const imageFile = ref<File | null>(null)
  const submitting = ref(false)
  const error = ref('')
  const createdProduct = ref<Product | null>(null)
  const createProduct = new CreateProduct(useProductRepository())

  function selectImage(event: Event) {
    imageFile.value = (event.target as HTMLInputElement).files?.[0] ?? null
  }

  async function uploadImage(categorySlug: string) {
    if (!imageFile.value) return null
    if (!imageFile.value.type.startsWith('image/')) throw new Error('Choisissez un fichier image.')
    if (imageFile.value.size > 5 * 1024 * 1024) throw new Error('L’image ne doit pas dépasser 5 Mo.')

    const folders: Record<string, string> = {
      nourriture: 'nouriture',
      nouriture: 'nouriture',
      dessert: 'desert',
      desert: 'desert',
      boisson: 'boisson',
      'fruit-de-mer': 'fruit_mere',
      'fruits-de-mer': 'fruit_mere',
      fruit_mere: 'fruit_mere',
    }
    const folder = folders[categorySlug] ?? categorySlug.replace(/[^a-z0-9_-]/gi, '_')
    const extension = imageFile.value.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'webp'
    const path = `${folder}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await useSupabase().storage.from('media').upload(path, imageFile.value, {
      contentType: imageFile.value.type,
      upsert: false,
    })
    if (uploadError) throw uploadError
    return path
  }

  async function submit(categorySlug: string) {
    if (submitting.value) return
    if (!form.name.trim()) { error.value = 'Le nom est obligatoire.'; return }
    if (!Number.isSafeInteger(Number(form.categoryId)) || Number(form.categoryId) < 1 || !categorySlug) {
      error.value = 'Choisissez une catégorie.'
      return
    }
    submitting.value = true
    error.value = ''
    createdProduct.value = null
    try {
      const imagePath = await uploadImage(categorySlug)
      const result = await createProduct.execute({
        name: form.name, categoryId: Number(form.categoryId), description: form.description.trim() || null,
        imagePath, price: form.price === '' ? null : Number(form.price),
        currency: form.currency.trim() || null, isAvailable: form.isAvailable,
      })
      if (result instanceof Failure) { error.value = result.message; return }
      createdProduct.value = result
      Object.assign(form, { name: '', categoryId: 0, description: '', price: '', currency: '', isAvailable: true })
      imageFile.value = null
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : 'Impossible d’enregistrer le produit.'
    } finally { submitting.value = false }
  }

  return { form, imageFile, submitting, error, createdProduct, selectImage, submit }
}

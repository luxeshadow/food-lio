export default defineEventHandler(async (event) => {
  const { data, error } = await serverSupabase(event)
    .from('categories')
    .select('id,name,slug,display_order')
    .eq('is_active', true)
    .order('display_order')
    .order('name')

  if (error) throw createError({ statusCode: 500, statusMessage: 'Impossible de charger les catégories' })
  return data
})

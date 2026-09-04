import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function useSupabase(): SupabaseClient {
  if (import.meta.client && client) return client
  const config = useRuntimeConfig()
  const url = config.public.supabaseUrl as string
  const anonKey = config.public.supabaseAnonKey as string

  if (!url || !anonKey) {
    throw new Error('Les variables Supabase publiques sont manquantes dans le fichier .env.')
  }

  const instance = createClient(url, anonKey)
  if (import.meta.client) client = instance
  return instance
}

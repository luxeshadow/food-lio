import { createClient } from '@supabase/supabase-js'
import type { H3Event } from 'h3'

export function serverSupabase(event: H3Event) {
  const config = useRuntimeConfig(event)
  if (!config.public.supabaseUrl || !config.public.supabaseAnonKey) {
    throw createError({ statusCode: 500, statusMessage: 'Configuration Supabase manquante' })
  }

  return createClient(config.public.supabaseUrl, config.public.supabaseAnonKey)
}

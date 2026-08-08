import { createClient } from '@supabase/supabase-js'

/*
 * Browser-safe Supabase client using the anon/public key.
 * Values come from .env (VITE_ prefix makes them available to Vite).
 * Row Level Security must be ON and an anon INSERT policy must exist —
 * see the SQL block in README.md.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Faltan variables de entorno: VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY ' +
    'deben estar definidas en el archivo .env'
  )
}

export const supabase = createClient(supabaseUrl, supabaseKey)

/* Typed row matching the event_quotes table schema */
export interface EventQuote {
  client_name:  string
  client_phone: string
  event_type:   string
  event_date:   string | null
  guest_count:  number | null
  notes:        string | null
}

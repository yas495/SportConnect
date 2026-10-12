import { createClient } from '@supabase/supabase-js'

// Maakt de verbinding met mijn Supabase-project.
// De URL en de publishable key komen uit het .env-bestand (via Vite).
function maakVerbinding() {
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error('Supabase-gegevens ontbreken. Controleer het .env-bestand.')
  }

  return createClient(url, key)
}

// Eén gedeelde verbinding die alle andere bestanden importeren
export const supabase = maakVerbinding()

// ============================================================
// profiel.js – profiel ophalen en opslaan (A2)
// ============================================================

import { supabase } from './supabase.js'

// Haalt het profiel van de ingelogde gebruiker op
export async function haalProfielOp(gebruikerId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, city, favorite_sports, level')
    .eq('id', gebruikerId)
    .single()

  if (error) {
    console.warn('Profiel ophalen mislukt:', error.message)
    throw new Error('Je profiel kon niet worden geladen.')
  }
  return data
}

// Slaat wijzigingen in het profiel op.
// RLS zorgt dat dit alleen lukt voor je eigen profiel (US8).
export async function slaProfielOp(gebruikerId, gegevens) {
  const { data, error } = await supabase
    .from('profiles')
    .update({
      full_name: gegevens.full_name,
      city: gegevens.city || null,
      favorite_sports: gegevens.favorite_sports,
      level: gegevens.level || null,
    })
    .eq('id', gebruikerId)
    .select()
    .single()

  if (error) {
    console.warn('Profiel opslaan mislukt:', error.message)
    throw new Error('Je profiel kon niet worden opgeslagen.')
  }
  return data
}

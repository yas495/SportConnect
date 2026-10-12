// ============================================================
// activiteiten.js – activiteiten ophalen, aanmaken, meedoen
// ============================================================

import { supabase } from './supabase.js'

// Vaste keuzelijsten, zodat het filteren op sport betrouwbaar werkt
export const SPORTEN = [
  'Badminton', 'Basketbal', 'Beachvolleybal', 'Fitness', 'Hardlopen', 'Hockey',
  'Padel', 'Squash', 'Tennis', 'Voetbal', 'Volleybal', 'Wielrennen', 'Zaalvoetbal', 'Zwemmen',
]
export const NIVEAUS = ['beginner', 'gemiddeld', 'gevorderd']

// De datum van vandaag als "YYYY-MM-DD" (lokale tijd)
export function vandaag() {
  const nu = new Date()
  const maand = String(nu.getMonth() + 1).padStart(2, '0')
  const dag = String(nu.getDate()).padStart(2, '0')
  return `${nu.getFullYear()}-${maand}-${dag}`
}

// Haalt alle activiteiten vanaf vandaag op, gesorteerd op datum.
// filters = { sport, city } – een leeg filter betekent "alles" (B1).
// Per activiteit halen we ook de user_id's van de deelnemers op,
// zodat we de vrije plekken en de knopstatus kunnen bepalen.
export async function haalActiviteitenOp(filters = {}) {
  let query = supabase
    .from('activities')
    .select('id, sport, date, start_time, location, city, max_participants, level, participants(user_id)')
    .gte('date', vandaag())
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })

  if (filters.sport) query = query.eq('sport', filters.sport)
  if (filters.city) query = query.eq('city', filters.city)

  const { data, error } = await query
  if (error) {
    console.warn('Activiteiten ophalen mislukt:', error.message)
    throw new Error('De activiteiten konden niet worden geladen.')
  }
  return data
}

// Haalt één activiteit op, met de organisator en de deelnemers.
// "creator:profiles!creator_id" betekent: haal het profiel op via de
// kolom creator_id en noem het resultaat "creator".
export async function haalActiviteitOp(id) {
  const { data, error } = await supabase
    .from('activities')
    .select(`
      *,
      creator:profiles!creator_id ( id, full_name, city, favorite_sports ),
      participants ( user_id, joined_at, profile:profiles ( full_name ) )
    `)
    .eq('id', id)
    .order('joined_at', { referencedTable: 'participants', ascending: true })
    .maybeSingle()

  if (error) {
    console.warn('Activiteit ophalen mislukt:', error.message)
    throw new Error('De activiteit kon niet worden geladen.')
  }
  return data // null als de activiteit niet bestaat
}

// Slaat een nieuwe activiteit op met de ingelogde gebruiker als maker (A3).
// De database-trigger voegt de maker daarna automatisch toe als deelnemer.
export async function maakActiviteit(gebruikerId, gegevens) {
  const { data, error } = await supabase
    .from('activities')
    .insert({ ...gegevens, creator_id: gebruikerId })
    .select('id')
    .single()

  if (error) {
    console.warn('Activiteit aanmaken mislukt:', error.message)
    throw new Error('De activiteit kon niet worden opgeslagen. Controleer de gegevens.')
  }
  return data
}

// Meldt de gebruiker aan: één rij toevoegen aan participants (A5, US4)
export async function meldAan(activiteitId, gebruikerId) {
  const { error } = await supabase
    .from('participants')
    .insert({ activity_id: activiteitId, user_id: gebruikerId })

  if (error) {
    console.warn('Aanmelden mislukt:', error.code, error.message)
    // 23505 = dubbele primaire sleutel: je doet al mee (B3)
    if (error.code === '23505') throw new Error('Je bent al aangemeld voor deze activiteit.')
    // 42501 = RLS weigert: de activiteit is vol of voorbij
    if (error.code === '42501') throw new Error('Aanmelden lukt niet: de activiteit is vol of al geweest.')
    throw new Error('Aanmelden is mislukt. Probeer het opnieuw.')
  }
}

// Meldt de gebruiker af: zijn rij uit participants verwijderen (US7)
export async function meldAf(activiteitId, gebruikerId) {
  const { error } = await supabase
    .from('participants')
    .delete()
    .eq('activity_id', activiteitId)
    .eq('user_id', gebruikerId)

  if (error) {
    console.warn('Afmelden mislukt:', error.message)
    throw new Error('Afmelden is mislukt. Probeer het opnieuw.')
  }
}

// Vrije plekken = maximum min het aantal aanmeldingen.
// Dit getal wordt niet opgeslagen, zodat het nooit verkeerd kan raken.
export function berekenVrijePlekken(activiteit) {
  return activiteit.max_participants - activiteit.participants.length
}

// Bepaalt welke knop getoond wordt: 'afmelden', 'vol' of 'meedoen' (A5)
export function bepaalKnopStatus(activiteit, gebruikerId) {
  const doetMee = activiteit.participants.some((p) => p.user_id === gebruikerId)
  if (doetMee) return 'afmelden'
  if (berekenVrijePlekken(activiteit) <= 0) return 'vol'
  return 'meedoen'
}

// Telt per sport hoeveel activiteiten er zijn, populairste eerst (C2)
export function telPopulaireSporten(activiteiten, aantal = 5) {
  const telling = {}
  for (const a of activiteiten) {
    telling[a.sport] = (telling[a.sport] || 0) + 1
  }
  return Object.entries(telling)
    .map(([sport, aantalActiviteiten]) => ({ sport, aantal: aantalActiviteiten }))
    .sort((a, b) => b.aantal - a.aantal || a.sport.localeCompare(b.sport))
    .slice(0, aantal)
}

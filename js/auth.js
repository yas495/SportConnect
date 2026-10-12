// ============================================================
// auth.js – registreren, inloggen, uitloggen en sessie (A1)
// Supabase Auth regelt het veilig opslaan van wachtwoorden.
// ============================================================

import { supabase } from './supabase.js'

// Maakt een nieuw account aan. De naam gaat mee als "metadata";
// de database-trigger handle_new_user zet die in profiles.full_name.
export async function registreer(naam, email, wachtwoord) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password: wachtwoord,
    options: {
      data: { full_name: naam },
      emailRedirectTo: paginaUrl('activiteiten.html'),
    },
  })
  if (error) throw new Error(vertaalFout(error))
  return data // data.session is leeg als e-mailbevestiging aan staat
}

// Logt de gebruiker in met e-mail en wachtwoord
export async function login(email, wachtwoord) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: wachtwoord })
  if (error) throw new Error(vertaalFout(error))
  return data
}

// Logt de gebruiker uit en gaat terug naar het inlogscherm
export async function logout() {
  await supabase.auth.signOut()
  window.location.replace('./index.html')
}

// Controleert of de gebruiker is ingelogd. Zo niet, dan gaat hij
// naar het inlogscherm. Wordt bovenaan elke pagina uitgevoerd.
// Geeft de ingelogde gebruiker terug (één plek voor alle functies).
export async function checkSessie() {
  const { data } = await supabase.auth.getSession()
  if (!data.session) {
    window.location.replace('./index.html')
    // Wacht "voor altijd", zodat de rest van de pagina niet verder laadt
    return new Promise(() => {})
  }
  return data.session.user
}

// Stuurt een e-mail met een link om een nieuw wachtwoord te kiezen
export async function vraagWachtwoordResetAan(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: paginaUrl('wachtwoord-reset.html'),
  })
  if (error) throw new Error(vertaalFout(error))
}

// Slaat het nieuwe wachtwoord op (na klikken op de link in de e-mail)
export async function slaNieuwWachtwoordOp(wachtwoord) {
  const { error } = await supabase.auth.updateUser({ password: wachtwoord })
  if (error) throw new Error(vertaalFout(error))
}

// Volledige URL van een pagina in dezelfde map als de huidige pagina.
// Werkt zowel lokaal (localhost) als later op GitHub Pages.
function paginaUrl(bestand) {
  return new URL(bestand, window.location.href).href
}

// Zet foutmeldingen van Supabase om naar duidelijke Nederlandse tekst (B2)
function vertaalFout(error) {
  const meldingen = {
    invalid_credentials: 'E-mailadres of wachtwoord is onjuist.',
    email_not_confirmed: 'Je e-mailadres is nog niet bevestigd. Klik eerst op de link in je mail.',
    user_already_exists: 'Er bestaat al een account met dit e-mailadres.',
    email_exists: 'Er bestaat al een account met dit e-mailadres.',
    weak_password: 'Dit wachtwoord is te zwak. Gebruik minimaal 6 tekens.',
    same_password: 'Het nieuwe wachtwoord moet anders zijn dan het oude.',
    email_address_invalid: 'Dit e-mailadres is ongeldig.',
    validation_failed: 'Controleer of je e-mailadres goed is ingevuld.',
    over_email_send_rate_limit: 'Er zijn te veel e-mails verstuurd. Probeer het over een tijdje opnieuw.',
    over_request_rate_limit: 'Te veel pogingen. Wacht even en probeer het opnieuw.',
    session_not_found: 'Je sessie is verlopen. Vraag een nieuwe resetlink aan.',
  }
  console.warn('Supabase Auth-fout:', error.code, error.message)
  return meldingen[error.code] || 'Er ging iets mis. Probeer het opnieuw.'
}

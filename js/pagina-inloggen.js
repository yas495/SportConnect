// ============================================================
// pagina-inloggen.js – koppelt de formulieren op index.html
// aan de functies uit auth.js
// ============================================================

import { supabase } from './supabase.js'
import { login, registreer, vraagWachtwoordResetAan } from './auth.js'
import { toonMelding, verbergMelding, zetKnopBezig } from './ui.js'

const formulieren = {
  inloggen: document.getElementById('form-inloggen'),
  registreren: document.getElementById('form-registreren'),
  vergeten: document.getElementById('form-vergeten'),
}

// Is de gebruiker al ingelogd? Dan direct door naar de activiteiten.
const { data } = await supabase.auth.getSession()
if (data.session) window.location.replace('./activiteiten.html')

// Wisselen tussen inloggen, registreren en wachtwoord vergeten
function toonFormulier(naam) {
  verbergMelding()
  for (const [sleutel, form] of Object.entries(formulieren)) {
    form.hidden = sleutel !== naam
  }
  document.title = `${{ inloggen: 'Inloggen', registreren: 'Registreren', vergeten: 'Wachtwoord vergeten' }[naam]} – SportConnect`
}

document.querySelectorAll('[data-naar]').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault()
    toonFormulier(link.dataset.naar)
  })
})

// Eenvoudige controle op een geldig e-mailadres
function isEmail(tekst) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(tekst)
}

// ---------- Inloggen ----------
formulieren.inloggen.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('login-email').value.trim()
  const wachtwoord = document.getElementById('login-wachtwoord').value

  if (!email || !wachtwoord) return toonMelding('Vul je e-mailadres en wachtwoord in.')
  if (!isEmail(email)) return toonMelding('Vul een geldig e-mailadres in.')

  const knop = e.submitter
  zetKnopBezig(knop, true, 'Inloggen…')
  try {
    await login(email, wachtwoord)
    window.location.replace('./activiteiten.html')
  } catch (fout) {
    toonMelding(fout.message)
    zetKnopBezig(knop, false)
  }
})

// ---------- Registreren ----------
formulieren.registreren.addEventListener('submit', async (e) => {
  e.preventDefault()
  const naam = document.getElementById('reg-naam').value.trim()
  const email = document.getElementById('reg-email').value.trim()
  const wachtwoord = document.getElementById('reg-wachtwoord').value

  if (!naam || !email || !wachtwoord) return toonMelding('Vul je naam, e-mailadres en wachtwoord in.')
  if (!isEmail(email)) return toonMelding('Vul een geldig e-mailadres in.')
  if (wachtwoord.length < 6) return toonMelding('Je wachtwoord moet minimaal 6 tekens hebben.')

  const knop = e.submitter
  zetKnopBezig(knop, true, 'Account aanmaken…')
  try {
    const resultaat = await registreer(naam, email, wachtwoord)
    if (resultaat.session) {
      // E-mailbevestiging staat uit: direct ingelogd
      window.location.replace('./profiel.html?nieuw=1')
    } else {
      toonFormulier('inloggen')
      toonMelding('Je account is aangemaakt! Bevestig je e-mailadres via de link in je mail en log daarna in.', 'succes')
    }
  } catch (fout) {
    toonMelding(fout.message)
  } finally {
    zetKnopBezig(knop, false)
  }
})

// ---------- Wachtwoord vergeten ----------
formulieren.vergeten.addEventListener('submit', async (e) => {
  e.preventDefault()
  const email = document.getElementById('vergeten-email').value.trim()

  if (!email) return toonMelding('Vul je e-mailadres in.')
  if (!isEmail(email)) return toonMelding('Vul een geldig e-mailadres in.')

  const knop = e.submitter
  zetKnopBezig(knop, true, 'Versturen…')
  try {
    await vraagWachtwoordResetAan(email)
    // We zeggen altijd hetzelfde, ook als het adres niet bestaat.
    // Zo kan niemand uitzoeken welke e-mailadressen een account hebben.
    toonMelding('Als dit e-mailadres bij ons bekend is, ontvang je binnen een paar minuten een mail met een resetlink.', 'succes')
  } catch (fout) {
    toonMelding(fout.message)
  } finally {
    zetKnopBezig(knop, false)
  }
})

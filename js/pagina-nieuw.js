// ============================================================
// pagina-nieuw.js – een activiteit aanmaken (A3, US5, logica 7.2)
// ============================================================

import { checkSessie } from './auth.js'
import { haalProfielOp } from './profiel.js'
import { maakActiviteit, SPORTEN, NIVEAUS, vandaag } from './activiteiten.js'
import { toonMelding, verbergMelding, toonNavAvatar, hoofdletter, zetKnopBezig } from './ui.js'

const gebruiker = await checkSessie()

const velden = {
  sport: document.getElementById('sport'),
  niveau: document.getElementById('niveau'),
  datum: document.getElementById('datum'),
  tijd: document.getElementById('tijd'),
  locatie: document.getElementById('locatie'),
  plaats: document.getElementById('plaats'),
  plekken: document.getElementById('plekken'),
  omschrijving: document.getElementById('omschrijving'),
}

// Keuzelijsten vullen
for (const sport of SPORTEN) velden.sport.add(new Option(sport, sport))
for (const niveau of NIVEAUS) velden.niveau.add(new Option(hoofdletter(niveau), niveau))

// In de datumkiezer kun je geen dag in het verleden kiezen
velden.datum.min = vandaag()

// Navigatie-avatar en de woonplaats als standaard-plaats invullen
try {
  const profiel = await haalProfielOp(gebruiker.id)
  toonNavAvatar(profiel)
  if (profiel.city) velden.plaats.value = profiel.city
} catch {
  // Geen probleem: het formulier werkt ook zonder profielgegevens
}

// Controleert het formulier. Geeft een foutmelding terug, of null als alles klopt.
function controleer() {
  const verplicht = ['sport', 'niveau', 'datum', 'tijd', 'locatie', 'plaats', 'plekken']
  const leeg = verplicht.filter((naam) => !velden[naam].value.trim())

  // Lege velden rood maken, zodat de gebruiker ziet wat er mist
  for (const naam of verplicht) velden[naam].classList.toggle('fout', leeg.includes(naam))
  if (leeg.length) return 'Vul alle verplichte velden (*) in.'

  if (velden.datum.value < vandaag()) {
    velden.datum.classList.add('fout')
    return 'De datum mag niet in het verleden liggen.'
  }

  const plekken = Number(velden.plekken.value)
  if (!Number.isInteger(plekken) || plekken < 2 || plekken > 50) {
    velden.plekken.classList.add('fout')
    return 'Het aantal plekken moet tussen 2 en 50 liggen.'
  }
  return null
}

document.getElementById('form-nieuw').addEventListener('submit', async (e) => {
  e.preventDefault()
  verbergMelding()

  const fout = controleer()
  if (fout) return toonMelding(fout)

  const knop = e.submitter
  zetKnopBezig(knop, true, 'Opslaan…')
  try {
    await maakActiviteit(gebruiker.id, {
      sport: velden.sport.value,
      level: velden.niveau.value,
      date: velden.datum.value,
      start_time: velden.tijd.value,
      location: velden.locatie.value.trim(),
      city: velden.plaats.value.trim(),
      max_participants: Number(velden.plekken.value),
      description: velden.omschrijving.value.trim() || null,
    })
    // Terug naar het overzicht, waar de nieuwe activiteit nu tussen staat
    window.location.href = './activiteiten.html?aangemaakt=1'
  } catch (err) {
    toonMelding(err.message)
    zetKnopBezig(knop, false)
  }
})

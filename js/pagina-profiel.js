// ============================================================
// pagina-profiel.js – profiel bekijken en aanpassen (A2, US2)
// ============================================================

import { checkSessie, logout } from './auth.js'
import { haalProfielOp, slaProfielOp } from './profiel.js'
import { SPORTEN, NIVEAUS } from './activiteiten.js'
import { toonMelding, verbergMelding, toonNavAvatar, initialen, hoofdletter, escapeHtml, zetKnopBezig } from './ui.js'

const gebruiker = await checkSessie()

const form = document.getElementById('form-profiel')
const naamVeld = document.getElementById('naam')
const woonplaatsVeld = document.getElementById('woonplaats')
const niveauVeld = document.getElementById('niveau')
const chipsVak = document.getElementById('sport-chips')

// De gekozen favoriete sporten (wordt bijgewerkt bij toevoegen/verwijderen)
let favorieten = []

// Niveau-keuzes in de select zetten
for (const niveau of NIVEAUS) {
  niveauVeld.add(new Option(hoofdletter(niveau), niveau))
}

// Samenvatting links bijwerken (initialen, naam, plaats en niveau)
function toonSamenvatting(profiel) {
  document.getElementById('profiel-avatar').textContent = initialen(profiel.full_name)
  document.getElementById('profiel-naam').textContent = profiel.full_name || 'Naam onbekend'
  const delen = []
  if (profiel.city) delen.push(profiel.city)
  if (profiel.level) delen.push(`${profiel.level} niveau`)
  document.getElementById('profiel-sub').textContent = delen.join(' · ') || 'Vul je profiel aan'
  toonNavAvatar(profiel)
}

// Chips met favoriete sporten tekenen, plus een keuzelijst om toe te voegen
function toonChips() {
  const nogKiesbaar = SPORTEN.filter((s) => !favorieten.includes(s))
  chipsVak.innerHTML = `
    ${favorieten.map((sport) => `
      <span class="chip">
        ${escapeHtml(sport)}
        <button type="button" class="chip-weg" data-sport="${escapeHtml(sport)}" aria-label="${escapeHtml(sport)} verwijderen">×</button>
      </span>`).join('')}
    ${nogKiesbaar.length ? `
      <select class="chip chip-toevoegen" id="sport-toevoegen" aria-label="Sport toevoegen">
        <option value="">+ Toevoegen</option>
        ${nogKiesbaar.map((s) => `<option value="${s}">${s}</option>`).join('')}
      </select>` : ''}`
}

// Klik op × verwijdert een sport
chipsVak.addEventListener('click', (e) => {
  const knop = e.target.closest('.chip-weg')
  if (!knop) return
  favorieten = favorieten.filter((s) => s !== knop.dataset.sport)
  toonChips()
})

// Kiezen in "+ Toevoegen" voegt een sport toe
chipsVak.addEventListener('change', (e) => {
  if (e.target.id !== 'sport-toevoegen' || !e.target.value) return
  favorieten.push(e.target.value)
  toonChips()
})

// Keuzelijst voor sporten direct tonen, ook als het laden hieronder mislukt
toonChips()

// Profiel laden en het formulier vullen
try {
  const profiel = await haalProfielOp(gebruiker.id)
  naamVeld.value = profiel.full_name
  woonplaatsVeld.value = profiel.city || ''
  niveauVeld.value = profiel.level || ''
  favorieten = [...profiel.favorite_sports]
  toonSamenvatting(profiel)
  toonChips()

  // Net geregistreerd? Dan een welkomstbericht.
  if (new URLSearchParams(location.search).has('nieuw')) {
    toonMelding('Welkom bij SportConnect! Vul je profiel aan, zodat anderen zien met wie ze gaan sporten.', 'succes')
  }
} catch (fout) {
  toonMelding(fout.message)
}

// Opslaan
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  verbergMelding()
  const naam = naamVeld.value.trim()
  if (!naam) return toonMelding('Je naam mag niet leeg zijn.')

  const knop = e.submitter
  zetKnopBezig(knop, true, 'Opslaan…')
  try {
    const profiel = await slaProfielOp(gebruiker.id, {
      full_name: naam,
      city: woonplaatsVeld.value.trim(),
      favorite_sports: favorieten,
      level: niveauVeld.value,
    })
    toonSamenvatting(profiel)
    toonMelding('Je profiel is opgeslagen.', 'succes')
  } catch (fout) {
    toonMelding(fout.message)
  } finally {
    zetKnopBezig(knop, false)
  }
})

document.getElementById('uitloggen').addEventListener('click', logout)

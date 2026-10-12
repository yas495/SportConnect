// ============================================================
// ui.js – alles wat iets op het scherm zet (DOM)
// ============================================================

import { berekenVrijePlekken, bepaalKnopStatus } from './activiteiten.js'

// Zet tekst veilig om naar HTML. Zonder dit zou iemand bijvoorbeeld
// <script> in een omschrijving kunnen zetten dat dan bij anderen
// wordt uitgevoerd (XSS). Gebruik dit bij ALLE gebruikersinvoer.
export function escapeHtml(tekst) {
  return String(tekst ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

// Toont een succes- of foutmelding in het element met id="melding" (B2)
export function toonMelding(tekst, type = 'fout') {
  const melding = document.getElementById('melding')
  if (!melding) return
  melding.textContent = tekst
  melding.className = `melding melding-${type}`
  melding.hidden = false
}

export function verbergMelding() {
  const melding = document.getElementById('melding')
  if (melding) melding.hidden = true
}

// "Daan de Vries" -> "DV" (profielinitialen in plaats van een foto, C1)
export function initialen(naam) {
  const delen = String(naam || '').trim().split(/\s+/).filter(Boolean)
  if (delen.length === 0) return '?'
  const eerste = delen[0][0]
  const laatste = delen.length > 1 ? delen[delen.length - 1][0] : ''
  return (eerste + laatste).toUpperCase()
}

// Een datum uit de database ("2026-10-10") omzetten naar een Date.
// We maken de datum zelf in lokale tijd, anders kan hij door de
// tijdzone een dag verschuiven.
function naarDatum(datumTekst) {
  const [jaar, maand, dag] = datumTekst.split('-').map(Number)
  return new Date(jaar, maand - 1, dag)
}

// "2026-10-10" + "14:00:00" -> "Za 10 okt · 14:00" (voor de kaarten)
export function formatKort(datumTekst, tijdTekst) {
  const datum = naarDatum(datumTekst)
  const dag = datum.toLocaleDateString('nl-NL', { weekday: 'short' }).replace('.', '')
  const rest = datum.toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' }).replace('.', '')
  return `${hoofdletter(dag)} ${rest} · ${tijdTekst.slice(0, 5)}`
}

// "2026-10-10" + "14:00:00" -> "Zaterdag 10 oktober · 14:00" (detailpagina)
export function formatLang(datumTekst, tijdTekst) {
  const datum = naarDatum(datumTekst)
  const tekst = datum.toLocaleDateString('nl-NL', { weekday: 'long', day: 'numeric', month: 'long' })
  return `${hoofdletter(tekst)} · ${tijdTekst.slice(0, 5)}`
}

export function hoofdletter(tekst) {
  return tekst.charAt(0).toUpperCase() + tekst.slice(1)
}

// Tekst voor de vrije plekken: "2 plekken vrij", "1 plek vrij", "Vol (10/10)"
export function plekkenTekst(activiteit) {
  const vrij = berekenVrijePlekken(activiteit)
  if (vrij <= 0) return `Vol (${activiteit.max_participants}/${activiteit.max_participants})`
  return vrij === 1 ? '1 plek vrij' : `${vrij} plekken vrij`
}

// Maakt de HTML voor de Meedoen/Afmelden/Vol-knop (A5)
export function knopHtml(activiteit, gebruikerId, extraClass = '') {
  const status = bepaalKnopStatus(activiteit, gebruikerId)
  const id = activiteit.id
  if (status === 'afmelden') {
    return `<button class="knop knop-omlijnd ${extraClass}" data-actie="afmelden" data-id="${id}">Afmelden</button>`
  }
  if (status === 'vol') {
    return `<button class="knop ${extraClass}" disabled>Vol</button>`
  }
  return `<button class="knop ${extraClass}" data-actie="meedoen" data-id="${id}">Meedoen</button>`
}

// Zet de activiteitenkaarten op het scherm (A4)
export function toonActiviteiten(activiteiten, gebruikerId) {
  const lijst = document.getElementById('activiteiten-lijst')

  if (activiteiten.length === 0) {
    lijst.innerHTML = `
      <div class="leeg">
        <p>Er zijn geen activiteiten gevonden.</p>
        <a href="./nieuw.html" class="knop">Maak zelf een activiteit aan</a>
      </div>`
    return
  }

  lijst.innerHTML = activiteiten.map((a) => {
    const vrij = berekenVrijePlekken(a)
    return `
      <article class="kaart activiteit-kaart" data-id="${a.id}">
        <div class="kaart-kop">
          <span class="sportletter">${escapeHtml(a.sport[0])}</span>
          <div>
            <h3>${escapeHtml(a.sport)}</h3>
            <p class="kaart-info">📅 ${formatKort(a.date, a.start_time)}</p>
            <p class="kaart-info">📍 ${escapeHtml(a.location)}, ${escapeHtml(a.city)}</p>
          </div>
        </div>
        <div class="kaart-voet">
          <span class="${vrij > 0 ? 'plekken-vrij' : 'plekken-vol'}">${plekkenTekst(a)}</span>
          ${knopHtml(a, gebruikerId)}
        </div>
      </article>`
  }).join('')
}

// Vult de navigatiebalk met de initialen van de ingelogde gebruiker
export function toonNavAvatar(profiel) {
  const avatar = document.getElementById('nav-avatar')
  if (avatar && profiel) {
    avatar.textContent = initialen(profiel.full_name)
    avatar.title = profiel.full_name
  }
}

// Zet een knop tijdelijk op "bezig", zodat er niet dubbel geklikt wordt
export function zetKnopBezig(knop, bezig, tekst = 'Bezig…') {
  if (!knop) return
  if (bezig) {
    knop.dataset.origineel = knop.textContent
    knop.textContent = tekst
    knop.disabled = true
  } else {
    knop.textContent = knop.dataset.origineel || knop.textContent
    knop.disabled = false
  }
}

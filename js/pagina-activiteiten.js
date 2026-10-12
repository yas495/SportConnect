// ============================================================
// pagina-activiteiten.js – het activiteitenoverzicht
// (A4, A5, B1, C2, US3, US4, US7, logica 7.1)
// ============================================================

import { checkSessie } from './auth.js'
import { haalProfielOp } from './profiel.js'
import { haalActiviteitenOp, meldAan, meldAf, telPopulaireSporten, SPORTEN } from './activiteiten.js'
import { toonActiviteiten, toonMelding, verbergMelding, toonNavAvatar, escapeHtml, zetKnopBezig } from './ui.js'

const gebruiker = await checkSessie()

const filterSport = document.getElementById('filter-sport')
const filterPlaats = document.getElementById('filter-plaats')
const lijst = document.getElementById('activiteiten-lijst')

for (const sport of SPORTEN) filterSport.add(new Option(sport, sport))

// Haalt de activiteiten op met de gekozen filters en zet ze op het scherm
async function laadActiviteiten() {
  try {
    const activiteiten = await haalActiviteitenOp({
      sport: filterSport.value,
      city: filterPlaats.value,
    })
    toonActiviteiten(activiteiten, gebruiker.id)
  } catch (fout) {
    toonMelding(fout.message)
  }
}

// Toont de populairste sporten als klikbare chips (C2)
function toonPopulair(alleActiviteiten) {
  const populair = telPopulaireSporten(alleActiviteiten)
  const vak = document.getElementById('populair')
  if (populair.length === 0) return
  vak.innerHTML = `<span class="populair-titel">Populair:</span>` + populair.map(({ sport, aantal }) => `
    <button type="button" class="chip chip-klik" data-sport="${escapeHtml(sport)}">
      <span class="sportletter sportletter-klein">${escapeHtml(sport[0])}</span>
      ${escapeHtml(sport)} <span class="tekst-zacht">(${aantal})</span>
    </button>`).join('')
  vak.hidden = false
}

// ---------- Startup ----------
try {
  // Profiel voor de begroeting en de navigatie
  const profiel = await haalProfielOp(gebruiker.id)
  toonNavAvatar(profiel)
  const voornaam = profiel.full_name.split(' ')[0]
  if (voornaam) document.getElementById('begroeting').textContent = `Hoi ${voornaam}, waar heb je zin in?`

  // Eén keer alles ophalen om de plaatsen-filter en "populair" te vullen
  const alle = await haalActiviteitenOp()
  const plaatsen = [...new Set(alle.map((a) => a.city))].sort((a, b) => a.localeCompare(b))
  for (const plaats of plaatsen) filterPlaats.add(new Option(plaats, plaats))
  toonPopulair(alle)

  // Standaard filteren op de eigen woonplaats, als daar activiteiten zijn
  if (profiel.city && plaatsen.includes(profiel.city)) {
    filterPlaats.value = profiel.city
    await laadActiviteiten()
  } else {
    toonActiviteiten(alle, gebruiker.id)
  }
} catch (fout) {
  toonMelding(fout.message)
  lijst.innerHTML = ''
}

// Bericht na het aanmaken van een activiteit
if (new URLSearchParams(location.search).has('aangemaakt')) {
  toonMelding('Je activiteit is aangemaakt! Je doet zelf automatisch mee.', 'succes')
  history.replaceState(null, '', location.pathname)
}

// ---------- Filters (opnieuw ophalen bij elke wijziging) ----------
filterSport.addEventListener('change', laadActiviteiten)
filterPlaats.addEventListener('change', laadActiviteiten)

document.getElementById('populair').addEventListener('click', (e) => {
  const chip = e.target.closest('[data-sport]')
  if (!chip) return
  filterSport.value = chip.dataset.sport
  laadActiviteiten()
})

// ---------- Klikken op kaarten en knoppen ----------
// Eén luisteraar op de hele lijst (event delegation), omdat de
// kaarten steeds opnieuw worden getekend.
lijst.addEventListener('click', async (e) => {
  const knop = e.target.closest('button[data-actie]')

  if (knop) {
    verbergMelding()
    const id = Number(knop.dataset.id)
    zetKnopBezig(knop, true, '…')
    try {
      if (knop.dataset.actie === 'meedoen') {
        await meldAan(id, gebruiker.id)
        toonMelding('Je doet mee! 🎉', 'succes')
      } else {
        await meldAf(id, gebruiker.id)
        toonMelding('Je bent afgemeld. Je plek is weer vrij voor iemand anders.', 'succes')
      }
    } catch (fout) {
      toonMelding(fout.message)
    }
    // Scherm bijwerken: knop en vrije plekken veranderen mee
    await laadActiviteiten()
    return
  }

  // Klik op de kaart zelf: naar de detailpagina
  const kaart = e.target.closest('.activiteit-kaart')
  if (kaart && !e.target.closest('button')) {
    window.location.href = `./activiteit.html?id=${kaart.dataset.id}`
  }
})

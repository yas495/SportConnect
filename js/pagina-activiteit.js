// ============================================================
// pagina-activiteit.js – details van één activiteit (US6)
// Het id staat in de URL, bijvoorbeeld activiteit.html?id=12
// ============================================================

import { checkSessie } from './auth.js'
import { haalProfielOp } from './profiel.js'
import { haalActiviteitOp, meldAan, meldAf, berekenVrijePlekken } from './activiteiten.js'
import {
  toonMelding, verbergMelding, toonNavAvatar, escapeHtml, initialen,
  formatLang, hoofdletter, knopHtml, zetKnopBezig,
} from './ui.js'

const gebruiker = await checkSessie()
const detail = document.getElementById('detail')
const id = Number(new URLSearchParams(location.search).get('id'))

haalProfielOp(gebruiker.id).then(toonNavAvatar).catch(() => {})

// Tekent de hele detailpagina (ontwerp 5.5)
function toonDetail(a) {
  const vrij = berekenVrijePlekken(a)
  const aantal = a.participants.length
  const plekTekst = vrij <= 0 ? 'vol' : vrij === 1 ? 'nog 1 plek vrij' : `nog ${vrij} plekken vrij`
  const organisatorSub = [a.creator.city, a.creator.favorite_sports.join(', ').toLowerCase()]
    .filter(Boolean).join(' · ')

  // Deelnemers als initialen, aangevuld met lege plekken (max. 12 rondjes)
  const leeg = Math.min(Math.max(vrij, 0), 12)
  const deelnemersHtml =
    a.participants.map((p) => `
      <span class="avatar ${p.user_id === a.creator_id ? 'avatar-groen' : ''}"title="${escapeHtml(p.profile?.full_name)}">
        ${escapeHtml(initialen(p.profile?.full_name))}
      </span>`).join('') +
    '<span class="avatar avatar-leeg">+</span>'.repeat(leeg)

  document.title = `${a.sport} – SportConnect`
  detail.innerHTML = `
    <div class="detail-kop">
      <span class="sportletter sportletter-groot">${escapeHtml(a.sport[0])}</span>
      <div>
        <h1>${escapeHtml(a.sport)}</h1>
        <p class="tekst-zacht">Niveau: ${escapeHtml(a.level)}</p>
      </div>
    </div>

    <div class="detail-raster">
      <section class="kaart">
        <h4 class="kopje">Informatie</h4>
        <p>📅 ${formatLang(a.date, a.start_time)}</p>
        <p>📍 ${escapeHtml(a.location)}, ${escapeHtml(a.city)}</p>
        <p>👥 ${a.max_participants} spelers, ${plekTekst}</p>
        <h4 class="kopje">Omschrijving</h4>
        <p>${a.description ? escapeHtml(a.description) : '<span class="tekst-zacht">Geen omschrijving.</span>'}</p>
      </section>

      <aside class="detail-zijkant">
        <section class="kaart">
          <h4 class="kopje">Organisator</h4>
          <div class="persoon">
            <span class="avatar avatar-groen">${escapeHtml(initialen(a.creator.full_name))}</span>
            <div>
              <strong>${escapeHtml(a.creator.full_name)}</strong>
              <p class="tekst-zacht klein">${escapeHtml(hoofdletter(organisatorSub))}</p>
            </div>
          </div>
        </section>

        <section class="kaart">
          <h4 class="kopje">Deelnemers (${aantal}/${a.max_participants})</h4>
          <div class="deelnemers">${deelnemersHtml}</div>
        </section>

        ${knopHtml(a, gebruiker.id, 'knop-breed')}
      </aside>
    </div>`
}

async function laad() {
  if (!id) {
    detail.innerHTML = '<p>Deze activiteit bestaat niet.</p>'
    return
  }
  try {
    const activiteit = await haalActiviteitOp(id)
    if (!activiteit) {
      detail.innerHTML = '<p>Deze activiteit bestaat niet (meer).</p>'
      return
    }
    toonDetail(activiteit)
  } catch (fout) {
    toonMelding(fout.message)
    detail.innerHTML = ''
  }
}

await laad()

// Meedoen / afmelden
detail.addEventListener('click', async (e) => {
  const knop = e.target.closest('button[data-actie]')
  if (!knop) return
  verbergMelding()
  zetKnopBezig(knop, true)
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
  await laad()
})

// ============================================================
// pagina-wachtwoord-reset.js
// De gebruiker komt hier via de link in de reset-mail.
// supabase-js leest de sleutel uit de link en maakt daarmee een
// tijdelijke sessie, zodat het nieuwe wachtwoord opgeslagen kan worden.
// ============================================================

import { supabase } from './supabase.js'
import { slaNieuwWachtwoordOp } from './auth.js'
import { toonMelding, zetKnopBezig } from './ui.js'

const form = document.getElementById('form-reset')

// Geen geldige sessie uit de link? Dan is de link verlopen of ongeldig.
const { data } = await supabase.auth.getSession()
if (!data.session) {
  toonMelding('Deze resetlink is ongeldig of verlopen. Vraag via "Wachtwoord vergeten?" een nieuwe link aan.')
  form.querySelector('button').disabled = true
}

form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const wachtwoord = document.getElementById('nieuw-wachtwoord').value
  const herhaling = document.getElementById('herhaal-wachtwoord').value

  if (!wachtwoord || !herhaling) return toonMelding('Vul beide velden in.')
  if (wachtwoord.length < 6) return toonMelding('Je wachtwoord moet minimaal 6 tekens hebben.')
  if (wachtwoord !== herhaling) return toonMelding('De wachtwoorden zijn niet hetzelfde.')

  const knop = e.submitter
  zetKnopBezig(knop, true, 'Opslaan…')
  try {
    await slaNieuwWachtwoordOp(wachtwoord)
    toonMelding('Je wachtwoord is gewijzigd. Je wordt doorgestuurd…', 'succes')
    setTimeout(() => window.location.replace('./activiteiten.html'), 1500)
  } catch (fout) {
    toonMelding(fout.message)
    zetKnopBezig(knop, false)
  }
})

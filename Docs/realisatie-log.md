# Realisatie-log SportConnect

Per afgeronde stap: wat is gebouwd, welke bestanden/tabellen, problemen en oplossingen, hoe getest.

---

## Stap 0 – Projectopzet (12-10-2026)

**Wat is gebouwd**
- Project opgezet met Vite (dev-server en build) en `@supabase/supabase-js`.
- Bestandsstructuur volgens hoofdstuk 9 van het ontwerp: vijf HTML-pagina's, `css/style.css` en de map `js/`.
- `js/supabase.js` met `maakVerbinding()`. Die maakt met `createClient` de verbinding met Supabase. URL en key komen uit `.env`.
- Basisstijl uit hoofdstuk 5.2: kleuren als CSS-variabelen, lettertype Inter, navigatiebalk, knoppen en kaarten.
- `vite.config.js` bouwt alle vijf pagina's en gebruikt relatieve paden (`base: './'`) voor GitHub Pages later (B4).

**Bestanden**
- Nieuw: `package.json`, `vite.config.js`, `.gitignore`, `.env.example`, `.env` (niet in git), `index.html`, `activiteiten.html`, `activiteit.html`, `nieuw.html`, `profiel.html`, `css/style.css`, `js/supabase.js`, `Docs/realisatie-log.md`.
- Tabellen: nog geen.

**Keuzes**
- Ik gebruik de *publishable key* van Supabase (nieuwe vorm van de anon key). Die mag in de browser staan, omdat RLS de data beschermt. De service-role key wordt nergens gebruikt.
- `.env` staat in `.gitignore`, zodat de keys niet in git komen. `.env.example` laat zien welke variabelen nodig zijn.

**Problemen en oplossingen**
- Geen.

**Hoe getest**
- `npm run build`: alle vijf pagina's worden gebouwd zonder fouten.
- Supabase is bereikbaar met de publishable key (de auth-healthcheck gaf status 200).
- Nog te doen door Yassin: `npm run dev`, de pagina's openen in de browser, controleren dat de navigatiebalk werkt en dat de console leeg is.

📸 **Screenshot maken:** de mappenstructuur in VS Code en de geopende pagina in de browser.

---

## Stap 1 – Database (12-10-2026)

**Wat is gebouwd**
- Drie tabellen volgens ERD 6.1 en 6.2: `profiles`, `activities` en `participants` (A7).
- `participants` heeft een samengestelde primaire sleutel (`activity_id`, `user_id`). Daardoor kan iemand zich maar één keer aanmelden (B3).
- Trigger `handle_new_user`: bij registratie wordt automatisch een profiel gemaakt met de ingevulde naam.
- Trigger `add_creator_as_participant`: de maker van een activiteit wordt automatisch de eerste deelnemer (ontwerp 7.2 stap 4).
- RLS staat aan op alle drie de tabellen, met policies volgens tabel 6.3 (A8). Elke policy heeft een comment met uitleg.
- Extra controle in de database: aanmelden lukt alleen als de activiteit niet vol is en niet in het verleden ligt. Een activiteit aanmaken lukt alleen met een datum vanaf vandaag.
- Indexen op de externe sleutels (`creator_id`, `participants.user_id`) en op de datum, voor snelheid.

**Bestanden**
- `supabase/migrations/20261012100000_create_tables.sql`
- `supabase/migrations/20261012100100_triggers.sql`
- `supabase/migrations/20261012100200_rls_policies.sql`

**Problemen en oplossingen**
- Met alleen de publishable key kan ik geen tabellen aanmaken. Dat is bewust zo en een veiligheidsmaatregel. De migraties zijn daarom uitgevoerd in de SQL Editor van Supabase.
- Mijn account bestond al voordat de trigger er was, en had daardoor geen profiel. Opslaan gaf toen de melding "Je profiel kon niet worden opgeslagen". Oplossing: de trigger-migratie maakt nu ook profielen aan voor accounts die al bestaan (`insert ... on conflict do nothing`).

**Hoe getest (RLS)**
Getest met directe verzoeken aan de database, ingelogd als gebruiker "Bas Aarts", op de data van gebruiker "yassin karidi":

| Test | Resultaat |
|---|---|
| Profiel van een ander wijzigen | 0 rijen gewijzigd ✅ |
| Activiteit van een ander wijzigen | 0 rijen gewijzigd ✅ |
| Activiteit van een ander verwijderen | 0 rijen verwijderd ✅ |
| Aanmelding van een ander verwijderen | 0 rijen verwijderd ✅ |
| Een ander aanmelden | geweigerd (42501, RLS) ✅ |
| Activiteit aanmaken namens een ander | geweigerd (42501, RLS) ✅ |
| Activiteit aanmaken in het verleden | geweigerd (42501, RLS) ✅ |
| Twee keer aanmelden (B3) | geweigerd (23505, primaire sleutel) ✅ |
| Niet ingelogd (anon) data lezen | "permission denied" ✅ |
| Controle achteraf: data van yassin | ongewijzigd ✅ |

Niet getest: een activiteit die echt vol is. Daarvoor zijn meer accounts nodig dan er plekken zijn.

📸 **Screenshot maken:** de Table Editor met de drie tabellen, de lijst policies (Authentication → Policies) en de **Advisors** (Security en Performance). Die adviezen moet Yassin zelf in het dashboard bekijken.

---

## Stap 2 – Inloggen, registreren en wachtwoord vergeten (12-10-2026)

**Wat is gebouwd**
- `index.html`: tweedelig inlogscherm volgens 5.3, met drie formulieren: inloggen, registreren (met naam) en wachtwoord vergeten.
- `js/auth.js`: `registreer()`, `login()`, `logout()`, `checkSessie()`, `vraagWachtwoordResetAan()`, `slaNieuwWachtwoordOp()`.
- Supabase-fouten worden vertaald naar duidelijke Nederlandse meldingen (B2).
- `wachtwoord-reset.html`: een nieuw wachtwoord kiezen via de link in de mail. **Aanvulling op het ontwerp, op verzoek toegevoegd.**
- `js/ui.js`: `toonMelding()` en hulpfuncties, waaronder `escapeHtml()` tegen XSS.
- Per pagina een klein startscript (`js/pagina-*.js`) dat de knoppen koppelt aan de functies uit hoofdstuk 8. Dat is een kleine aanvulling op de bestandsstructuur uit hoofdstuk 9.
- Favicon toegevoegd, omdat de console anders een 404-fout gaf.

**Problemen en oplossingen**
- Een tweede Vite-server vernieuwde de cache, waardoor de draaiende dev-server een 504-fout gaf ("Outdated Optimize Dep"). Oplossing: dev-server herstarten. Voor de tests gebruik ik `vite preview` (poort 4173).
- Bij wachtwoord vergeten gaf Supabase "te veel e-mails verstuurd". De standaardmailserver van Supabase mag maar een paar mails per uur sturen. De foutmelding wordt netjes getoond.
- "Confirm email" staat aan. Nieuwe gebruikers moeten dus eerst hun e-mail bevestigen. De standaardmailserver mailt alleen naar adressen van het projectteam. Voor echte gebruikers is een eigen SMTP-server nodig.

**Hoe getest**
- Niet ingelogd naar `activiteiten.html` → doorgestuurd naar het inlogscherm ✅
- Lege velden, verkeerd wachtwoord, ongeldig e-mailadres, te kort wachtwoord → duidelijke foutmelding ✅
- Resetpagina openen zonder geldige link → melding "ongeldig of verlopen" ✅
- Juist wachtwoord → naar het activiteitenoverzicht ✅
- Uitloggen en daarna `profiel.html` openen → terug naar het inlogscherm ✅

---

## Stap 3 – Profiel (12-10-2026)

**Wat is gebouwd**
- `profiel.html` + `js/profiel.js` (`haalProfielOp()`, `slaProfielOp()`) volgens 5.7 (A2, US2).
- Links staat een samenvatting met initialen-avatar (C1), plaats, niveau en uitloggen. Rechts staat het formulier met favoriete sporten als chips (× = verwijderen, "+ Toevoegen" = keuzelijst).

**Hoe getest**
- Profiel laden → de naam uit de registratie staat erin ✅
- Lege naam opslaan → foutmelding ✅
- Woonplaats, niveau en drie sporten opslaan → "opgeslagen", en na herladen zijn ze bewaard ✅

---

## Stap 4 – Activiteit aanmaken (12-10-2026)

**Wat is gebouwd**
- `nieuw.html` + `maakActiviteit()` volgens 5.6 en logica 7.2 (A3, US5).
- Controle op verplichte velden (lege velden worden rood), datum niet in het verleden en 2–50 plekken. De plaats wordt vooraf ingevuld met de woonplaats.
- Na het opslaan ga je terug naar het overzicht met een succesmelding. De maker doet automatisch mee (trigger).

**Hoe getest**
- Lege velden → foutmelding en rode velden ✅
- Datum in het verleden → foutmelding ✅ (de database weigert dit ook, zie stap 1)
- 1 plek → foutmelding ✅
- Goed pad → activiteit staat in het overzicht en de maker heeft de knop "Afmelden" ✅

---

## Stap 5 en 6 – Activiteitenoverzicht en filters (12-10-2026)

**Wat is gebouwd**
- `activiteiten.html`: kaarten in drie kolommen met sportletter, datum, locatie en vrije plekken (A4, C1).
- `haalActiviteitenOp(filters)` haalt activiteiten vanaf vandaag op, gesorteerd op datum en tijd.
- `berekenVrijePlekken()` en `bepaalKnopStatus()` bepalen welke knop er komt: Meedoen, Afmelden of Vol (A5).
- `meldAan()` en `meldAf()` (US4, US7). Na een klik wordt de lijst opnieuw opgehaald, zodat de knop en het aantal plekken kloppen.
- Filters op sport en plaats (B1). Elke wijziging haalt de activiteiten opnieuw op (logica 7.1 stap 3). De plaats staat standaard op je woonplaats.
- **C2:** een rij "Populair" met de vijf sporten met de meeste activiteiten. Klikken zet het sportfilter.

**Problemen en oplossingen**
- `ui.js` en `activiteiten.js` importeerden elkaar (kringverwijzing). `vandaag()` is verplaatst naar `activiteiten.js`.

**Hoe getest**
- Afmelden bij Hardlopen, Fitness en Beachvolleybal → de knop wordt Meedoen en er komt 1 plek bij ✅
- Meedoen bij Fitness → de knop wordt Afmelden en er gaat 1 plek af ✅
- Filters: alle plaatsen (8), Padel (2), Padel + Weert (1), Zwemmen (geen resultaten, met een melding) ✅
- Klik op een populaire sport → het filter wordt gezet ✅

---

## Stap 7 – Activiteit details (12-10-2026)

**Wat is gebouwd**
- `activiteit.html?id=…` + `haalActiviteitOp(id)` volgens 5.5 (US6).
- Links staan de informatie en de omschrijving. Rechts staan de organisator (naam, plaats, sporten), de deelnemers als initialen met lege plekken, en de knop.
- `creator:profiles!creator_id(...)` is nodig omdat er twee verbindingen zijn tussen activities en profiles (de maker en, via participants, de deelnemers). Zo weet Supabase welke verbinding bedoeld is.

**Hoe getest**
- Detailpagina eigen activiteit → 1/4 deelnemers ✅; afmelden → 0/4 en de knop wordt Meedoen ✅
- Activiteit van een andere organisator → organisator "yassin karidi", 2/4 deelnemers ✅
- Onbekend id → melding "bestaat niet" ✅

---

## Testsessie in de browser (12-10-2026)
Alle schermen zijn automatisch getest in Microsoft Edge, met een schermbreedte van 1440 × 900. In de tweede testronde stonden **geen fouten in de console**. De eerste ronde liep vast voordat de console-check werd uitgevoerd. Alle screenshots staan in [screenshots.md](screenshots.md).

---

## Stap 8 – Online via GitHub Pages (B4) (12-10-2026)

**Wat is gebouwd**
- Repository: https://github.com/yas495/SportConnect
- `.github/workflows/deploy.yml`: bij elke push naar `main` bouwt GitHub Actions de site met Vite (`npm run build`) en publiceert de map `dist/` op GitHub Pages.
- De Supabase-URL en de publishable key staan niet in git (`.env` wordt genegeerd). Ze staan als repository-secrets in GitHub (Settings → Secrets and variables → Actions → Secrets).
- In Supabase zijn de Site URL en de Redirect URLs ingesteld op `https://yas495.github.io/SportConnect/`.
- Online adres: https://yas495.github.io/SportConnect/

**Problemen en oplossingen**
- De eerste deploy mislukte met "Failed to create deployment (status: 404)". GitHub Pages stond nog niet aan. Oplossing: Settings → Pages → Source op "GitHub Actions" zetten.
- Daarna stond de site online, maar de inlogknop deed niets en in de adresbalk kwam `/?` te staan. Oorzaak: de site was gebouwd zonder de variabelen, waardoor `maakVerbinding()` een fout gaf en de JavaScript niet draaide. In de online code stond "Supabase-gegevens ontbreken". Daarna bleek dat de gegevens bij Secrets stonden, terwijl de workflow Variables las. Oplossing: de workflow leest nu eerst Secrets en daarna Variables.

**Nog te doen**
- Advisors in het Supabase-dashboard bekijken en een screenshot maken.
- Testen of een volle activiteit "Vol" toont. Daarvoor zijn extra accounts nodig.

**Hoe getest (online)**
- https://yas495.github.io/SportConnect/ geopend, ingelogd met het testaccount, het overzicht toonde 5 activiteiten (filter Eindhoven), daarna uitgelogd. Er stonden geen fouten in de console ✅ (screenshot 21)

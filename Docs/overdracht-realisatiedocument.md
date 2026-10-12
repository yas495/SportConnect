# Overdracht: SportConnect → realisatiedocument

Dit bestand bevat alle informatie over de realisatie van SportConnect. Het is bedoeld als bron voor het schrijven van het **realisatiedocument**. Het hoort bij het ontwerpdocument "Design Sport Community" (Yassin Karidi, Fontys ICT, HBO-ICT jaar 1, challenge Sports Community). In dat document wordt verwezen naar hoofdstuknummers (bijv. "ontwerp 6.3") en eisnummers (A1–C2).

- **Student:** Yassin Karidi (600018@student.fontys.nl)
- **Bouwperiode:** 12-10-2026
- **Online:** https://yas495.github.io/SportConnect/
- **Code:** https://github.com/yas495/SportConnect
- **Hulpmiddel:** de code is gebouwd met hulp van de AI-assistent Claude Code, stap voor stap volgens het ontwerpdocument. Yassin heeft keuzes gemaakt, getest en de Supabase- en GitHub-instellingen zelf gedaan.

---

## 1. Resultaat per eis (MoSCoW)

| Eis | Omschrijving | Status | Hoe gerealiseerd |
|---|---|---|---|
| A1 | Account aanmaken en inloggen via Supabase Auth | ✅ | `index.html` + `js/auth.js` (`registreer`, `login`, `logout`, `checkSessie`). Registreren vraagt ook om de **naam**. |
| A2 | Profiel met naam, woonplaats, favoriete sporten, niveau | ✅ | `profiel.html` + `js/profiel.js`. Favoriete sporten als chips (toevoegen via keuzelijst, verwijderen met ×). |
| A3 | Activiteit aanmaken met sport, datum, tijd, locatie, plekken | ✅ | `nieuw.html` + `maakActiviteit()`. Ook niveau, plaats en omschrijving (optioneel). |
| A4 | Activiteiten als kaarten met sport, datum, locatie, vrije plekken | ✅ | `activiteiten.html`, 3 kolommen, `toonActiviteiten()` in `ui.js`. |
| A5 | Knop aanmelden/afmelden, uitgeschakeld als vol | ✅ | Knop wisselt tussen Meedoen / Afmelden / Vol (grijs, uitgeschakeld). Ook de database weigert aanmelden bij een volle activiteit. |
| A6 | Werkt goed in de browser op een laptop | ✅ | Getest op 1440×900. Onder 1100 px breed 2 kolommen. |
| A7 | Database met profiles, activities, participants (ERD) | ✅ | 3 SQL-migraties in `supabase/migrations/`. |
| A8 | RLS: gebruikers passen alleen eigen gegevens aan | ✅ | RLS op alle tabellen, policies volgens ontwerp 6.3. Getest met twee accounts. |
| B1 | Filteren op sport en plaats | ✅ | Twee dropdowns. Elke wijziging haalt de activiteiten opnieuw op (ontwerp 7.1 stap 3). De plaats staat standaard op de eigen woonplaats. |
| B2 | Duidelijke foutmeldingen | ✅ | `toonMelding()` + vertaling van Supabase-foutcodes naar Nederlands (bijv. "E-mailadres of wachtwoord is onjuist."). |
| B3 | Database voorkomt dubbele aanmelding | ✅ | Samengestelde primaire sleutel (`activity_id`, `user_id`) in participants. Getest: fout 23505. |
| B4 | Online via GitHub Pages | ✅ | GitHub Actions-workflow bouwt met Vite en publiceert automatisch bij elke push. |
| C1 | Sportletters en profielinitialen | ✅ | Sportletter in een groen vakje op kaarten en detailpagina. Initialen-avatar in de navigatie, het profiel en bij deelnemers. |
| C2 | Overzicht van de populairste sporten | ✅ | Rij "Populair:" boven de kaarten met de top 5 sporten (aantal activiteiten). Klikken zet het filter. |

## 2. User stories

| US | Gerealiseerd in |
|---|---|
| US1 Account aanmaken en inloggen | Inlogscherm met registreren (naam, e-mail, wachtwoord) |
| US2 Favoriete sporten en niveau in profiel | Profielpagina |
| US3 Zoeken op sport en plaats | Filters op het overzicht |
| US4 Met één klik aanmelden | Knop "Meedoen" op kaart en detailpagina |
| US5 Zelf activiteit aanmaken met datum en tijd | Pagina "Nieuw" |
| US6 Organisator ziet wie meedoet en hoeveel plekken vrij | Detailpagina: deelnemers (x/max) met initialen en lege plekken |
| US7 Afmelden zodat plek vrijkomt | Knop "Afmelden". Het aantal vrije plekken gaat direct omhoog. |
| US8 Alleen ik kan mijn profiel en activiteiten aanpassen | RLS-policies (zie §5) |

---

## 3. Techniek en architectuur

- **Frontend:** HTML, CSS, JavaScript (ES-modules). Er is geen framework gebruikt, zoals in ontwerp hoofdstuk 8.
- **Supabase:** `@supabase/supabase-js` voor de verbinding met Supabase (Auth + PostgreSQL-database).
- **Vite:** dev-server (`npm run dev`) en build (`npm run build`) naar de map `dist/`. Gekozen omdat supabase-js als npm-pakket wordt geïmporteerd en omdat Vite de `.env`-variabelen in de code zet.
- **Geheimen:** de Supabase-URL en de publishable key staan in `.env`. Dat bestand staat in `.gitignore` en komt dus niet in git. `.env.example` laat zien welke variabelen nodig zijn. De service-role key wordt nergens gebruikt.
- **Online:** op GitHub staan de gegevens als repository-secrets. De workflow `.github/workflows/deploy.yml` geeft ze mee aan de build.
- **Veiligheid in de browser:** alle tekst van gebruikers gaat door `escapeHtml()` voordat hij op de pagina komt (bescherming tegen XSS).

### Bestandsstructuur (gerealiseerd)
```
index.html                 inloggen / registreren / wachtwoord vergeten
activiteiten.html          activiteitenoverzicht
activiteit.html            details van één activiteit (?id=…)
nieuw.html                 activiteit aanmaken
profiel.html               profiel
wachtwoord-reset.html      nieuw wachtwoord kiezen (AANVULLING)
css/style.css              opmaak van alle schermen
js/supabase.js             maakVerbinding()
js/auth.js                 registreer, login, logout, checkSessie, vraagWachtwoordResetAan, slaNieuwWachtwoordOp
js/profiel.js              haalProfielOp, slaProfielOp
js/activiteiten.js         haalActiviteitenOp(filters), haalActiviteitOp(id), maakActiviteit, meldAan, meldAf,
                           berekenVrijePlekken, bepaalKnopStatus, telPopulaireSporten, SPORTEN, NIVEAUS, vandaag
js/ui.js                   toonActiviteiten, toonMelding, toonNavAvatar, initialen, escapeHtml, datumopmaak
js/pagina-*.js             per pagina een startscript dat knoppen/formulieren koppelt aan de functies hierboven (AANVULLING)
public/favicon.svg         icoon in het browsertabblad
supabase/migrations/       3 SQL-migraties (database)
.github/workflows/deploy.yml   automatisch online zetten
Docs/                      ontwerp, realisatie-log, screenshots, dit bestand
```

### Hoe een pagina werkt (voorbeeld: activiteitenoverzicht)
1. `pagina-activiteiten.js` roept eerst `checkSessie()` aan. Wie niet is ingelogd, gaat naar `index.html`.
2. Het profiel wordt opgehaald voor de begroeting ("Hoi Bas"), de avatar en de standaardplaats van het filter.
3. `haalActiviteitenOp()` haalt activiteiten vanaf vandaag op, gesorteerd op datum en tijd, inclusief de `user_id` van de deelnemers.
4. Per activiteit berekent `berekenVrijePlekken()` = `max_participants − aantal deelnemers`. `bepaalKnopStatus()` kiest daarna Meedoen, Afmelden of Vol.
5. Bij een klik op Meedoen voegt `meldAan()` een rij toe aan `participants`. Daarna wordt de lijst opnieuw opgehaald, zodat de knop en de plekken kloppen (ontwerp 7.1 stap 5–7).
6. Alle knoppen gebruiken één click-listener op de lijst (event delegation), omdat de kaarten steeds opnieuw worden getekend.

---

## 4. Database

### Tabellen (volgens ERD 6.1 / 6.2)
- **profiles**: `id` (uuid, PK, FK → auth.users), `full_name`, `city`, `favorite_sports` (text[]), `level` (beginner/gemiddeld/gevorderd), `created_at`
- **activities**: `id` (bigint identity, PK), `creator_id` (FK → profiles), `sport`, `description` (optioneel), `date`, `start_time`, `location`, `city`, `max_participants` (2–50), `level`, `created_at`
- **participants**: `activity_id` + `user_id` samen PK (beide FK), `joined_at`
- Vrije plekken worden **niet opgeslagen** maar berekend, zoals in het ontwerp staat.
- Er zijn indexen op `activities.creator_id`, `activities(date, start_time)` en `participants.user_id`, voor snelheid.
- `on delete cascade`: als een account wordt verwijderd, verdwijnen het profiel, de activiteiten en de aanmeldingen mee.

### Triggers (automatische acties in de database)
1. **handle_new_user**: bij registratie wordt automatisch een rij in `profiles` gemaakt met de naam uit het registratieformulier. Daardoor heeft elke gebruiker altijd een profiel. De migratie maakt ook alsnog profielen aan voor accounts die al bestonden.
2. **add_creator_as_participant**: na het aanmaken van een activiteit wordt de maker automatisch de eerste deelnemer (ontwerp 7.2 stap 4). Omdat dit in de database gebeurt, kan het niet half mislukken.

### Row Level Security (ontwerp 6.3)
RLS staat aan op alle drie de tabellen. Wat niet expliciet is toegestaan, is verboden. Niet-ingelogde bezoekers (rol `anon`) hebben helemaal geen toegang.

| Tabel | Actie | Wie |
|---|---|---|
| profiles | bekijken | iedere ingelogde gebruiker |
| profiles | aanmaken / aanpassen | alleen jezelf (`id = auth.uid()`) |
| activities | bekijken | iedere ingelogde gebruiker |
| activities | aanmaken | alleen met jezelf als maker **en datum ≥ vandaag** |
| activities | aanpassen / verwijderen | alleen de maker |
| participants | bekijken | iedere ingelogde gebruiker |
| participants | aanmelden | alleen jezelf, **en alleen als de activiteit niet vol en niet voorbij is** |
| participants | afmelden | alleen je eigen aanmelding |

De vetgedrukte controles zijn een **aanvulling** op tabel 6.3. De knop "Vol" in de browser is handig voor de gebruiker, maar de database dwingt het ook echt af. Dat sluit aan bij Nielsens heuristiek "foutpreventie".
In de policies staat `(select auth.uid())` in plaats van `auth.uid()`. Dan rekent Postgres het één keer per query uit in plaats van per rij, wat sneller is. Dat is een advies van Supabase.

---

## 5. Testen

### Browsertests (automatisch in Microsoft Edge, 1440×900, testaccount "Bas Aarts")
| Test | Verwacht | Resultaat |
|---|---|---|
| Niet ingelogd `activiteiten.html` openen | naar het inlogscherm | ✅ |
| Inloggen met lege velden | foutmelding | ✅ |
| Inloggen met verkeerd wachtwoord | "E-mailadres of wachtwoord is onjuist." | ✅ |
| Registreren: lege velden / ongeldig e-mailadres / wachtwoord < 6 tekens | foutmelding | ✅ |
| Wachtwoord vergeten aanvragen | bevestiging | ⚠️ Supabase gaf "te veel e-mails verstuurd" (limiet van de standaardmailserver). De foutmelding werd wel netjes getoond. |
| Resetpagina zonder geldige link | "link ongeldig of verlopen" | ✅ |
| Inloggen met juiste gegevens | naar het overzicht | ✅ |
| Profiel laden | naam uit de registratie zichtbaar | ✅ |
| Profiel opslaan met lege naam | foutmelding | ✅ |
| Profiel opslaan (woonplaats, niveau, 3 sporten) + herladen | bewaard | ✅ |
| Activiteit aanmaken met lege velden | foutmelding + rode velden | ✅ |
| Activiteit met datum in het verleden | foutmelding | ✅ |
| Activiteit met 1 plek | foutmelding (2–50) | ✅ |
| Activiteit aanmaken (goed pad) | terug naar het overzicht, maker doet mee | ✅ |
| Afmelden (3 activiteiten) | knop → Meedoen, +1 plek vrij | ✅ |
| Meedoen | knop → Afmelden, −1 plek vrij | ✅ |
| Filters: alle plaatsen / Padel / Padel + Weert / Zwemmen | 8 / 2 / 1 / "geen activiteiten" | ✅ |
| Klik op populaire sport | filter wordt gezet | ✅ |
| Detailpagina eigen activiteit, afmelden | 1/4 → 0/4, knop wordt Meedoen | ✅ |
| Detailpagina activiteit van een ander | organisator "yassin karidi", 2/4 | ✅ |
| Detailpagina met onbekend id | "bestaat niet" | ✅ |
| Uitloggen, daarna profiel openen | naar het inlogscherm | ✅ |
| Console | geen fouten | ✅ |

### RLS-tests (directe verzoeken aan de database, ingelogd als "Bas Aarts", op de data van "yassin karidi")
| Poging | Resultaat |
|---|---|
| Profiel van een ander wijzigen | 0 rijen gewijzigd ✅ |
| Activiteit van een ander wijzigen | 0 rijen ✅ |
| Activiteit van een ander verwijderen | 0 rijen ✅ |
| Aanmelding van een ander verwijderen | 0 rijen ✅ |
| Een ander aanmelden | geweigerd, fout 42501 (RLS) ✅ |
| Activiteit aanmaken namens een ander | geweigerd, 42501 ✅ |
| Activiteit aanmaken in het verleden | geweigerd, 42501 ✅ |
| Twee keer aanmelden | geweigerd, 23505 (primaire sleutel, B3) ✅ |
| Niet ingelogd data lezen | "permission denied" ✅ |
| Controle achteraf | data van yassin ongewijzigd ✅ |

### Online test (GitHub Pages)
Ingelogd op https://yas495.github.io/SportConnect/: het overzicht laadt, uitloggen werkt en er stonden geen fouten in de console ✅

### Niet getest / beperkingen
- Een activiteit die echt **vol** is. Daarvoor zijn meer accounts nodig dan er plekken zijn. De logica en de databasecontrole zijn wel gebouwd.
- De **resetmail** zelf, door de mail-limiet van Supabase.
- "Confirm email" staat aan. De standaardmailserver van Supabase mailt alleen naar adressen van het projectteam. Voor echte gebruikers is een eigen SMTP-server nodig.

---

## 6. Problemen en oplossingen (chronologisch)

| # | Probleem | Oorzaak | Oplossing |
|---|---|---|---|
| 1 | Tabellen konden niet vanuit de AI-assistent worden aangemaakt | De publishable key mag bewust geen tabellen aanmaken (veiligheid) | Migraties zelf uitgevoerd in de Supabase SQL Editor |
| 2 | Dev-server gaf fout 504 "Outdated Optimize Dep" | Een tweede Vite-server vernieuwde de gedeelde cache | Dev-server herstarten. Voor tests `vite preview` gebruikt. |
| 3 | `ui.js` en `activiteiten.js` importeerden elkaar | Kringverwijzing tussen modules | `vandaag()` verplaatst naar `activiteiten.js` |
| 4 | 404-fout in de console | Geen favicon | `public/favicon.svg` toegevoegd |
| 5 | "Je profiel kon niet worden opgeslagen" en geen sporten kiesbaar | Migraties waren nog niet uitgevoerd. Het account bestond al vóór de trigger, waardoor er geen profiel was. | Migraties uitgevoerd. Trigger-migratie maakt nu ook profielen voor bestaande accounts. Sportenkeuze wordt altijd getoond. |
| 6 | Wachtwoord vergeten: "te veel e-mails" | Limiet van de standaardmailserver van Supabase | Geen codefout. De melding werkt. Voor productie is een eigen SMTP nodig. |
| 7 | Eerste deploy mislukt: "Failed to create deployment (404)" | GitHub Pages stond niet aan | Settings → Pages → Source: GitHub Actions |
| 8 | Online deed de inlogknop niets (adres eindigde op `/?`) | Supabase-gegevens stonden bij **Secrets**, de workflow las **Variables**. Zonder gegevens gaf `maakVerbinding()` een fout en draaide de JavaScript niet. | Workflow leest nu `secrets.X || vars.X` |
| 9 | Twee relaties tussen activities en profiles (maker én deelnemers) | Supabase weet niet welke bedoeld wordt | `creator:profiles!creator_id(...)` in de query |

---

## 7. Afwijkingen en aanvullingen ten opzichte van het ontwerp

| Wat | Waarom |
|---|---|
| **Wachtwoord vergeten** + pagina `wachtwoord-reset.html` | Op verzoek toegevoegd. Gebruikers die hun wachtwoord kwijt zijn, kunnen anders niet meer inloggen. |
| **Naam bij registratie** | Op verzoek toegevoegd, zodat het profiel direct een naam heeft (trigger zet hem in profiles). |
| `js/pagina-*.js` (startscripts per pagina) | De functies uit hoofdstuk 8 staan in de genoemde bestanden. Per pagina koppelt een klein script de knoppen aan die functies, zodat de herbruikbare functies los blijven van één scherm. |
| Vaste keuzelijst met 14 sporten | Zodat filteren op sport betrouwbaar werkt (geen spelvarianten). |
| Database controleert "vol" en "verleden" | Extra veiligheid bovenop de knop (foutpreventie). |
| Triggers voor profiel en maker-als-deelnemer | Betrouwbaarder dan dit vanuit JavaScript doen. |
| Geen eindtijd op de detailpagina | Het datamodel (6.2) heeft alleen `start_time`. De eindtijd in het UI-ontwerp is daarom weggelaten. |
| Geen knoppen om activiteiten te bewerken/verwijderen | Er staat geen scherm voor in het ontwerp. RLS staat het wel toe voor de maker (6.3). |
| **Telefoonweergave** (media query < 768px, alleen in `style.css`) | Op verzoek toegevoegd. Het ontwerp noemt een telefoonversie als mogelijke uitbreiding (hoofdstuk 2). Op een laptop verandert er niets. Getest op iPhone 13-formaat: niets breder dan het scherm, geen consolefouten. |
| Vite als dev-server/build | Nodig om supabase-js als npm-pakket te gebruiken en de keys via `.env` buiten git te houden. |

---

## 8. Screenshots (in `Docs/screenshots/`)

| Bestand | Toont | Eis/US |
|---|---|---|
| 01-inloggen.png | Inlogscherm (ontwerp 5.3) | A1 |
| 02-inloggen-leeg.png | Foutmelding lege velden | B2 |
| 03-inloggen-fout-wachtwoord.png | Foutmelding verkeerd wachtwoord | B2 |
| 04-registreren-fout.png | Registreren met naam, foute invoer | A1, B2 |
| 05-wachtwoord-vergeten.png | Wachtwoord vergeten (mail-limiet melding) | aanvulling, B2 |
| 06-wachtwoord-reset-ongeldig.png | Resetpagina met ongeldige link | aanvulling |
| 07-na-inloggen.png | Overzicht direct na inloggen | A1, A4 |
| 08-profiel-opgeslagen.png | Profiel opgeslagen | A2, C1 |
| 09-nieuw-lege-velden.png | Validatie, rode velden | A3, B2 |
| 10-nieuw-ingevuld.png | Formulier ingevuld | A3 |
| 11-activiteit-aangemaakt.png | Terug naar overzicht + melding | A3, 7.2 |
| 12-afgemeld.png | Na afmelden: Meedoen, plek vrij | A5, US7 |
| 13-activiteiten-overzicht.png | Overzicht met kaarten, filter op woonplaats | A4, A5, B1 |
| 14-alle-plaatsen.png | Alle plaatsen + populairste sporten | B1, C2 |
| 15-filter-padel-weert.png | Filter padel + Weert | B1, US3 |
| 16-filter-geen-resultaten.png | Lege staat | B1 |
| 17-activiteit-details.png | Details: info, organisator, deelnemers | US6 |
| 18-details-afgemeld.png | Details na afmelden (0/4) | US7 |
| 19-profiel.png | Profiel na herladen | A2 |
| 20-details-andere-organisator.png | Activiteit van een andere gebruiker | US6 |
| 21-online-github-pages.png | Online versie op GitHub Pages | B4 |
| 22 t/m 26-mobiel-*.png | Inloggen, overzicht, details, nieuw en profiel op een telefoon | aanvulling |

**Nog zelf te maken:** de Supabase Table Editor, de policies en de Security- en Performance-Advisors.

---

## 9. Reflectiepunten (aanzet voor het realisatiedocument)
- Het ontwerp was goed bruikbaar als bouwplan: schermen, datamodel, RLS-tabel en functienamen konden direct worden overgenomen.
- RLS bleek een belangrijk punt. Doordat de database zelf controleert, maakt het niet uit dat de key openbaar in de browser staat.
- Het meeste oponthoud zat niet in de code, maar in de configuratie: migraties uitvoeren, Supabase-instellingen, GitHub Pages en secrets versus variables.
- Testen met twee accounts liet zien dat de beveiliging echt werkt, en niet alleen in theorie.
- Verbeterpunten: een eigen mailserver (SMTP), activiteiten bewerken en verwijderen, en een eindtijd in het datamodel. (De mobiele weergave is al toegevoegd.)

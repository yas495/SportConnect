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

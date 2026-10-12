# Screenshots SportConnect

Gemaakt op 12-10-2026 tijdens de testsessie in Microsoft Edge (1440 × 900 pixels, laptopscherm).
Testaccount: "Bas Aarts". Een tweede account, "yassin karidi", is de organisator van de voetbalactiviteit.
Per screenshot staat welke eis of user story uit het ontwerpdocument ermee wordt aangetoond.

---

## 1. Inloggen en registreren (A1, B2, US1)

### 1.1 Inlogscherm (ontwerp 5.3)
Een niet-ingelogde gebruiker die `activiteiten.html` opent, wordt doorgestuurd naar dit scherm (`checkSessie()`).
![Inlogscherm](screenshots/01-inloggen.png)

### 1.2 Inloggen met lege velden
![Lege velden](screenshots/02-inloggen-leeg.png)

### 1.3 Inloggen met een verkeerd wachtwoord (B2)
![Verkeerd wachtwoord](screenshots/03-inloggen-fout-wachtwoord.png)

### 1.4 Registreren met naam: foute invoer
Het registratieformulier vraagt om naam, e-mailadres en wachtwoord. Hier is een te kort wachtwoord ingevuld.
![Registreren fout](screenshots/04-registreren-fout.png)

### 1.5 Wachtwoord vergeten (aanvulling op het ontwerp)
Supabase weigerde hier omdat er kort daarvoor al te veel mails waren verstuurd (de limiet van de standaardmailserver). De gebruiker krijgt daarover een duidelijke melding.
![Wachtwoord vergeten](screenshots/05-wachtwoord-vergeten.png)

### 1.6 Resetpagina zonder geldige link
![Reset ongeldig](screenshots/06-wachtwoord-reset-ongeldig.png)

### 1.7 Na het inloggen
![Na inloggen](screenshots/07-na-inloggen.png)

---

## 2. Profiel (A2, C1, US2)

### 2.1 Profiel opgeslagen
Naam, woonplaats, favoriete sporten (chips) en niveau. Links staat de avatar met initialen (C1).
![Profiel opgeslagen](screenshots/08-profiel-opgeslagen.png)

### 2.2 Profiel na herladen (gegevens bewaard)
![Profiel](screenshots/19-profiel.png)

---

## 3. Activiteit aanmaken (A3, US5, logica 7.2)

### 3.1 Lege verplichte velden worden rood gemarkeerd
![Lege velden](screenshots/09-nieuw-lege-velden.png)

### 3.2 Formulier ingevuld
![Ingevuld](screenshots/10-nieuw-ingevuld.png)

### 3.3 Activiteit aangemaakt
Na het opslaan ga je terug naar het overzicht. De maker doet automatisch mee: de knop is "Afmelden".
![Aangemaakt](screenshots/11-activiteit-aangemaakt.png)

---

## 4. Activiteitenoverzicht (A4, A5, US4, US7, logica 7.1)

### 4.1 Na afmelden: de knop wordt "Meedoen" en er komt een plek vrij
![Afgemeld](screenshots/12-afgemeld.png)

### 4.2 Overzicht gefilterd op de eigen woonplaats (Eindhoven)
Kaarten in drie kolommen met sportletter (C1), datum, locatie, vrije plekken en de knop Meedoen/Afmelden.
![Overzicht](screenshots/13-activiteiten-overzicht.png)

---

## 5. Filters en populairste sporten (B1, C2, US3)

### 5.1 Alle plaatsen, met bovenaan de populairste sporten (C2)
![Alle plaatsen](screenshots/14-alle-plaatsen.png)

### 5.2 Filter: Padel in Weert
Een gekozen filter wordt donkerblauw, zoals in de stijl uit 5.2.
![Filter padel weert](screenshots/15-filter-padel-weert.png)

### 5.3 Filter zonder resultaten
![Geen resultaten](screenshots/16-filter-geen-resultaten.png)

---

## 6. Activiteit details (US6)

### 6.1 Eigen activiteit: informatie, organisator, deelnemers (1/4) en lege plekken
![Details](screenshots/17-activiteit-details.png)

### 6.2 Na afmelden: 0/4 deelnemers, de knop wordt "Meedoen"
![Details afgemeld](screenshots/18-details-afgemeld.png)

### 6.3 Activiteit van een andere organisator
![Andere organisator](screenshots/20-details-andere-organisator.png)

---

## 7. Beveiliging (A8, B3)
RLS is getest met directe verzoeken aan de database. Een gebruiker kon geen profiel, activiteit of aanmelding van een ander wijzigen of verwijderen. Dubbel aanmelden werd geweigerd. Niet-ingelogde bezoekers krijgen geen toegang. De volledige tabel staat in [realisatie-log.md](realisatie-log.md) onder stap 1.

📸 **Zelf nog maken in het Supabase-dashboard:** de Table Editor, de policies en de Security- en Performance-Advisors.

---

## 8. Online via GitHub Pages (B4)
Ingelogd op https://yas495.github.io/SportConnect/. Het filter staat op de eigen woonplaats (donkerblauw, zie stijl 5.2). Er stonden geen fouten in de console.
![Online](screenshots/21-online-github-pages.png)

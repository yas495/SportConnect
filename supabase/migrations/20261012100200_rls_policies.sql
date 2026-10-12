-- ============================================================
-- Migratie 3: Row Level Security (ontwerp 6.3, eis A8)
--
-- Supabase maakt de database bereikbaar vanuit de browser.
-- Daarom controleert de database zelf wie wat mag.
-- Met RLS aan is alles verboden, behalve wat een policy toestaat.
--
-- auth.uid() = de id van de ingelogde gebruiker.
-- Ik schrijf (select auth.uid()) in plaats van auth.uid(): dan
-- rekent Postgres het één keer per query uit in plaats van per
-- rij. Dat is sneller (advies van de Supabase performance advisor).
-- ============================================================

alter table public.profiles     enable row level security;
alter table public.activities   enable row level security;
alter table public.participants enable row level security;

-- ------------------------------------------------------------
-- profiles
-- ------------------------------------------------------------

-- Bekijken: iedere ingelogde gebruiker mag alle profielen zien,
-- zodat je ziet met wie je gaat sporten (organisator, deelnemers).
create policy "Profielen zichtbaar voor ingelogde gebruikers"
  on public.profiles for select
  to authenticated
  using (true);

-- Aanmaken: alleen je eigen profiel (id moet jouw id zijn).
-- Normaal doet de trigger dit, maar zo kan niemand een profiel
-- voor een ander aanmaken.
create policy "Gebruiker maakt alleen eigen profiel aan"
  on public.profiles for insert
  to authenticated
  with check (id = (select auth.uid()));

-- Aanpassen: alleen je eigen profiel.
-- "using" = welke rijen je mag aanpassen,
-- "with check" = hoe de rij er na de wijziging uit mag zien
-- (je kunt de id dus ook niet veranderen in die van een ander).
create policy "Gebruiker past alleen eigen profiel aan"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- ------------------------------------------------------------
-- activities
-- ------------------------------------------------------------

-- Bekijken: iedere ingelogde gebruiker ziet alle activiteiten.
create policy "Activiteiten zichtbaar voor ingelogde gebruikers"
  on public.activities for select
  to authenticated
  using (true);

-- Aanmaken: alleen met jezelf als maker, en niet in het verleden.
-- Zo kan niemand een activiteit "namens" een ander aanmaken.
create policy "Gebruiker maakt activiteit aan met zichzelf als maker"
  on public.activities for insert
  to authenticated
  with check (
    creator_id = (select auth.uid())
    and date >= current_date
  );

-- Aanpassen: alleen de maker van de activiteit.
create policy "Alleen de maker past een activiteit aan"
  on public.activities for update
  to authenticated
  using (creator_id = (select auth.uid()))
  with check (creator_id = (select auth.uid()));

-- Verwijderen: alleen de maker van de activiteit.
create policy "Alleen de maker verwijdert een activiteit"
  on public.activities for delete
  to authenticated
  using (creator_id = (select auth.uid()));

-- ------------------------------------------------------------
-- participants
-- ------------------------------------------------------------

-- Bekijken: iedere ingelogde gebruiker ziet wie er meedoet (US6).
create policy "Deelnemers zichtbaar voor ingelogde gebruikers"
  on public.participants for select
  to authenticated
  using (true);

-- Aanmelden: alleen jezelf, en alleen als de activiteit nog niet
-- vol is en niet in het verleden ligt. De knop "Vol" in de browser
-- is handig voor de gebruiker, maar deze controle in de database
-- zorgt dat het ook echt niet kan (A5, foutpreventie).
create policy "Gebruiker meldt alleen zichzelf aan bij een niet-volle activiteit"
  on public.participants for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (
      select 1
      from public.activities a
      where a.id = activity_id
        and a.date >= current_date
        and (select count(*) from public.participants p where p.activity_id = a.id)
            < a.max_participants
    )
  );

-- Afmelden: alleen je eigen aanmelding verwijderen (US7).
create policy "Gebruiker meldt alleen zichzelf af"
  on public.participants for delete
  to authenticated
  using (user_id = (select auth.uid()));

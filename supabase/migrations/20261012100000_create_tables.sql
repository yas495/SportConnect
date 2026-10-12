-- ============================================================
-- Migratie 1: de drie tabellen uit het ERD (ontwerp 6.1 en 6.2)
-- profiles, activities en participants
-- ============================================================

-- ------------------------------------------------------------
-- profiles: het profiel van elke gebruiker (A2)
-- De id is dezelfde als de id in Supabase Auth (auth.users),
-- zodat het profiel direct aan het account gekoppeld is.
-- ------------------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  full_name       text not null default '',
  city            text,
  favorite_sports text[] not null default '{}',   -- lijst met favoriete sporten
  level           text check (level in ('beginner', 'gemiddeld', 'gevorderd')),
  created_at      timestamptz not null default now()
);

comment on table public.profiles is 'Profiel van een gebruiker: naam, woonplaats, favoriete sporten en niveau.';

-- ------------------------------------------------------------
-- activities: alle sportactiviteiten (A3)
-- Het aantal vrije plekken wordt NIET opgeslagen, maar berekend:
-- max_participants min het aantal rijen in participants.
-- ------------------------------------------------------------
create table public.activities (
  id               bigint generated always as identity primary key,
  creator_id       uuid not null references public.profiles (id) on delete cascade,
  sport            text not null,
  description      text,                                   -- optioneel
  date             date not null,
  start_time       time not null,
  location         text not null,
  city             text not null,                          -- gebruikt voor het filter (B1)
  max_participants integer not null check (max_participants between 2 and 50),
  level            text not null check (level in ('beginner', 'gemiddeld', 'gevorderd')),
  created_at       timestamptz not null default now()
);

comment on table public.activities is 'Sportactiviteiten die gebruikers aanmaken.';

-- Index op de externe sleutel, zodat "activiteiten van deze maker" snel gaat
create index activities_creator_id_idx on public.activities (creator_id);
-- Index voor de standaardsortering in het overzicht (op datum)
create index activities_date_idx on public.activities (date, start_time);

-- ------------------------------------------------------------
-- participants: koppeltabel voor de veel-op-veel-relatie
-- tussen gebruikers en activiteiten.
-- De primaire sleutel bestaat uit activity_id + user_id samen,
-- daardoor kan iemand zich maar één keer aanmelden (B3).
-- ------------------------------------------------------------
create table public.participants (
  activity_id bigint not null references public.activities (id) on delete cascade,
  user_id     uuid   not null references public.profiles (id) on delete cascade,
  joined_at   timestamptz not null default now(),
  primary key (activity_id, user_id)
);

comment on table public.participants is 'Wie doet mee aan welke activiteit. Eén rij per aanmelding.';

-- De primaire sleutel begint met activity_id; voor zoeken op user_id
-- ("aan welke activiteiten doe ik mee?") is een aparte index nodig.
create index participants_user_id_idx on public.participants (user_id);

-- ------------------------------------------------------------
-- Rechten: alleen ingelogde gebruikers (rol "authenticated")
-- mogen bij de tabellen. Niet-ingelogde bezoekers (rol "anon")
-- krijgen niets. RLS (migratie 3) bepaalt daarna per rij wat mag.
-- ------------------------------------------------------------
revoke all on public.profiles, public.activities, public.participants from anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.activities to authenticated;
grant select, insert, delete on public.participants to authenticated;

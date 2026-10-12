-- ============================================================
-- Migratie 2: automatische acties (triggers)
-- ============================================================

-- ------------------------------------------------------------
-- 1. Profiel aanmaken bij registratie
-- Als iemand zich registreert, maakt Supabase Auth een rij in
-- auth.users. Deze trigger maakt dan direct een profiel aan met
-- de naam die in het registratieformulier is ingevuld.
-- Zo heeft elke gebruiker altijd precies één profiel.
--
-- "security definer" is nodig omdat de trigger draait vanuit
-- Supabase Auth (niet als de ingelogde gebruiker).
-- "set search_path = ''" voorkomt dat iemand de functie kan
-- misleiden met een tabel met dezelfde naam in een ander schema.
-- ------------------------------------------------------------
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''));
  return new;
end;
$$;

-- De functie mag alleen door de trigger worden gebruikt,
-- niet rechtstreeks vanuit de browser.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Accounts die al bestonden vóór deze trigger krijgen hier alsnog
-- een profiel. "on conflict do nothing" slaat bestaande profielen over.
insert into public.profiles (id, full_name)
select id, coalesce(raw_user_meta_data ->> 'full_name', '')
from auth.users
on conflict (id) do nothing;

-- ------------------------------------------------------------
-- 2. Maker automatisch als eerste deelnemer (ontwerp 7.2 stap 4)
-- Na het aanmaken van een activiteit wordt de maker direct
-- toegevoegd aan participants. Omdat dit in de database gebeurt,
-- kan het niet "half" mislukken.
--
-- Deze functie draait als de ingelogde gebruiker zelf
-- (security invoker), dus de RLS-regels van participants
-- gelden gewoon: de maker meldt alleen zichzelf aan.
-- ------------------------------------------------------------
create function public.add_creator_as_participant()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.participants (activity_id, user_id)
  values (new.id, new.creator_id);
  return new;
end;
$$;

revoke execute on function public.add_creator_as_participant() from public, anon, authenticated;

create trigger on_activity_created
  after insert on public.activities
  for each row execute function public.add_creator_as_participant();

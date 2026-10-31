-- Apply only to a NEW dedicated RuneReturn project.
create table public.rr_characters (
  owner_id uuid not null references auth.users(id) on delete cascade,
  id uuid not null,
  game text not null check (game in ('osrs', 'rs3')),
  mode text not null check ((game = 'rs3' and mode = 'normal') or (game = 'osrs' and mode in ('normal', 'ironman', 'hardcore', 'ultimate'))),
  name text not null check (name ~ '^[A-Za-z0-9 -]{1,12}$' and name = trim(name)),
  snapshot jsonb,
  progress jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner_id, id),
  check (snapshot is null or (jsonb_typeof(snapshot) = 'object' and octet_length(snapshot::text) < 100000)),
  check (progress is null or (jsonb_typeof(progress) = 'object' and octet_length(progress::text) < 100000))
);
create unique index rr_characters_identity on public.rr_characters (owner_id, game, mode, lower(name));
alter table public.rr_characters enable row level security;
revoke all on public.rr_characters from anon;
grant select, insert, update, delete on public.rr_characters to authenticated;
create policy "Read own characters" on public.rr_characters for select to authenticated using ((select auth.uid()) = owner_id);
create policy "Add own characters" on public.rr_characters for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Update own characters" on public.rr_characters for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy "Remove own characters" on public.rr_characters for delete to authenticated using ((select auth.uid()) = owner_id);
create function public.rr_character_limit_and_timestamp()
returns trigger language plpgsql set search_path = '' as $$
begin
  if tg_op = 'INSERT' then
    perform pg_advisory_xact_lock(hashtextextended(new.owner_id::text, 0));
    if (select count(*) from public.rr_characters where owner_id = new.owner_id) >= 20
      and not exists (select 1 from public.rr_characters where owner_id = new.owner_id and id = new.id) then
      raise exception 'RuneReturn supports up to 20 saved characters per account';
    end if;
  end if;
  new.updated_at = now();
  return new;
end;
$$;
create trigger rr_characters_guard before insert or update on public.rr_characters
for each row execute function public.rr_character_limit_and_timestamp();

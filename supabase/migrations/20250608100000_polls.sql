-- Fase 03: encuestas, opciones, participantes y votos

-- ---------------------------------------------------------------------------
-- Tipos y utilidades
-- ---------------------------------------------------------------------------

create or replace function public.generate_share_token()
returns text
language plpgsql
volatile
as $$
declare
  chars text := 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i int;
begin
  for i in 1..10 loop
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  end loop;
  return result;
end;
$$;

-- ---------------------------------------------------------------------------
-- polls
-- ---------------------------------------------------------------------------

create table public.polls (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  max_participants int not null default 20
    check (max_participants > 0 and max_participants <= 100),
  time_limit_minutes int check (time_limit_minutes is null or time_limit_minutes > 0),
  status text not null default 'esperando'
    check (status in ('esperando', 'votando', 'ballotage', 'resultados', 'cerrado')),
  share_token text not null unique default public.generate_share_token(),
  created_at timestamptz not null default now(),
  started_at timestamptz,
  closes_at timestamptz
);

create index polls_host_id_idx on public.polls (host_id);
create index polls_share_token_idx on public.polls (share_token);

alter table public.polls enable row level security;

create policy "Host lee sus encuestas"
  on public.polls for select
  to authenticated
  using (host_id = auth.uid());

create policy "Host crea encuestas"
  on public.polls for insert
  to authenticated
  with check (host_id = auth.uid());

create policy "Host actualiza sus encuestas"
  on public.polls for update
  to authenticated
  using (host_id = auth.uid())
  with check (host_id = auth.uid());

create policy "Host elimina sus encuestas"
  on public.polls for delete
  to authenticated
  using (host_id = auth.uid());

-- Lectura pública por share_token vía función (evita exponer todas las filas)
create or replace function public.get_poll_by_share_token(p_token text)
returns public.polls
language sql
stable
security definer
set search_path = public
as $$
  select *
  from public.polls
  where share_token = p_token
  limit 1;
$$;

grant execute on function public.get_poll_by_share_token(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- poll_options
-- ---------------------------------------------------------------------------

create table public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls (id) on delete cascade,
  text text not null,
  image_url text,
  sort_order int not null default 0
);

create index poll_options_poll_id_idx on public.poll_options (poll_id);

alter table public.poll_options enable row level security;

create policy "Host gestiona opciones"
  on public.poll_options for all
  to authenticated
  using (
    exists (
      select 1
      from public.polls p
      where p.id = poll_options.poll_id
        and p.host_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.polls p
      where p.id = poll_options.poll_id
        and p.host_id = auth.uid()
    )
  );

create policy "Lectura de opciones en encuestas abiertas"
  on public.poll_options for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.polls p
      where p.id = poll_options.poll_id
        and p.status <> 'cerrado'
    )
  );

create or replace function public.get_poll_options_by_share_token(p_token text)
returns setof public.poll_options
language sql
stable
security definer
set search_path = public
as $$
  select po.*
  from public.poll_options po
  inner join public.polls p on p.id = po.poll_id
  where p.share_token = p_token
  order by po.sort_order asc;
$$;

grant execute on function public.get_poll_options_by_share_token(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- participants
-- ---------------------------------------------------------------------------

create table public.participants (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  nickname text not null,
  joined_at timestamptz not null default now(),
  unique (poll_id, nickname)
);

create index participants_poll_id_idx on public.participants (poll_id);
create index participants_user_id_idx on public.participants (user_id);

alter table public.participants enable row level security;

create or replace function public.poll_is_joinable(p_poll_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.polls p
    where p.id = p_poll_id
      and p.status in ('esperando', 'votando')
  );
$$;

grant execute on function public.poll_is_joinable(uuid) to anon, authenticated;

create or replace function public.check_max_participants()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count int;
  max_allowed int;
  poll_status text;
begin
  select p.max_participants, p.status
  into max_allowed, poll_status
  from public.polls p
  where p.id = new.poll_id;

  if poll_status is null then
    raise exception 'La encuesta no existe';
  end if;

  if poll_status not in ('esperando', 'votando') then
    raise exception 'La encuesta no acepta nuevos participantes';
  end if;

  select count(*)::int
  into current_count
  from public.participants
  where poll_id = new.poll_id;

  if current_count >= max_allowed then
    raise exception 'Se alcanzó el máximo de participantes (%)', max_allowed;
  end if;

  return new;
end;
$$;

create trigger enforce_max_participants
  before insert on public.participants
  for each row
  execute function public.check_max_participants();

create policy "Unirse a encuesta abierta"
  on public.participants for insert
  to anon, authenticated
  with check (
    public.poll_is_joinable(poll_id)
    and (user_id is null or user_id = auth.uid())
  );

create policy "Leer participantes de encuestas accesibles"
  on public.participants for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.polls p
      where p.id = participants.poll_id
        and (
          p.host_id = auth.uid()
          or p.status <> 'cerrado'
        )
    )
    or user_id = auth.uid()
  );

-- ---------------------------------------------------------------------------
-- votes
-- ---------------------------------------------------------------------------

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls (id) on delete cascade,
  participant_id uuid not null references public.participants (id) on delete cascade,
  option_id uuid not null references public.poll_options (id) on delete cascade,
  value boolean not null,
  round int not null default 1 check (round in (1, 2)),
  created_at timestamptz not null default now(),
  unique (participant_id, option_id, round)
);

create index votes_poll_id_idx on public.votes (poll_id);
create index votes_participant_id_idx on public.votes (participant_id);
create index votes_option_id_idx on public.votes (option_id);

alter table public.votes enable row level security;

create policy "Participante emite voto"
  on public.votes for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.polls p
      where p.id = votes.poll_id
        and p.status in ('votando', 'ballotage')
    )
    and exists (
      select 1
      from public.participants pt
      where pt.id = votes.participant_id
        and pt.poll_id = votes.poll_id
        and (pt.user_id is null or pt.user_id = auth.uid())
    )
    and exists (
      select 1
      from public.poll_options po
      where po.id = votes.option_id
        and po.poll_id = votes.poll_id
    )
  );

create policy "Host lee votos de sus encuestas"
  on public.votes for select
  to authenticated
  using (
    exists (
      select 1
      from public.polls p
      where p.id = votes.poll_id
        and p.host_id = auth.uid()
    )
  );

create policy "Participantes leen votos de la encuesta"
  on public.votes for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.polls p
      where p.id = votes.poll_id
        and p.status in ('votando', 'ballotage', 'resultados', 'cerrado')
    )
  );

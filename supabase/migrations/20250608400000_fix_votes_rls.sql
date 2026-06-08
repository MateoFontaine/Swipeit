-- Fix: anon no podía leer polls dentro de las policies de votes,
-- así que INSERT fallaba con error de RLS al votar como ghost.

create or replace function public.poll_allows_voting(p_poll_id uuid)
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
      and p.status in ('votando', 'ballotage')
  );
$$;

grant execute on function public.poll_allows_voting(uuid) to anon, authenticated;

create or replace function public.participant_can_vote(
  p_participant_id uuid,
  p_poll_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.participants pt
    where pt.id = p_participant_id
      and pt.poll_id = p_poll_id
      and (pt.user_id is null or pt.user_id = auth.uid())
  );
$$;

grant execute on function public.participant_can_vote(uuid, uuid) to anon, authenticated;

create or replace function public.option_belongs_to_poll(
  p_option_id uuid,
  p_poll_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.poll_options po
    where po.id = p_option_id
      and po.poll_id = p_poll_id
  );
$$;

grant execute on function public.option_belongs_to_poll(uuid, uuid) to anon, authenticated;

create or replace function public.can_read_poll_votes(p_poll_id uuid)
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
      and p.status in ('votando', 'ballotage', 'resultados', 'cerrado')
  );
$$;

grant execute on function public.can_read_poll_votes(uuid) to anon, authenticated;

drop policy if exists "Participante emite voto" on public.votes;

create policy "Participante emite voto"
  on public.votes for insert
  to anon, authenticated
  with check (
    public.poll_allows_voting(poll_id)
    and public.participant_can_vote(participant_id, poll_id)
    and public.option_belongs_to_poll(option_id, poll_id)
  );

drop policy if exists "Participantes leen votos de la encuesta" on public.votes;

create policy "Participantes leen votos de la encuesta"
  on public.votes for select
  to anon, authenticated
  using (public.can_read_poll_votes(poll_id));

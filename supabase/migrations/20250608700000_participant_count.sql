-- Conteo real de participantes (sin depender de RLS del cliente)

create or replace function public.get_participant_count(p_poll_id uuid)
returns int
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::int
  from public.participants
  where poll_id = p_poll_id;
$$;

grant execute on function public.get_participant_count(uuid) to anon, authenticated;

-- Usar conteo real en el trigger de máximo
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

  current_count := public.get_participant_count(new.poll_id);

  if current_count >= max_allowed then
    raise exception 'Se alcanzó el máximo de participantes (%)', max_allowed;
  end if;

  return new;
end;
$$;

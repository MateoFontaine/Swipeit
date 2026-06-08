-- Solo se puede unir durante "esperando". Después el host inicia la votación.

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
      and p.status = 'esperando'
  );
$$;

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

  if poll_status <> 'esperando' then
    raise exception 'La votación ya comenzó. No se aceptan nuevos participantes.';
  end if;

  current_count := public.get_participant_count(new.poll_id);

  if current_count >= max_allowed then
    raise exception 'Se alcanzó el máximo de participantes (%)', max_allowed;
  end if;

  return new;
end;
$$;

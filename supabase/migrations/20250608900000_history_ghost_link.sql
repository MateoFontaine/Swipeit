-- Fase 09: historial de participante y vinculación ghost → cuenta

-- ---------------------------------------------------------------------------
-- Polls en los que participó el usuario (excluye las que hostea)
-- ---------------------------------------------------------------------------

create or replace function public.get_participant_polls()
returns table (
  id uuid,
  host_id uuid,
  title text,
  description text,
  max_participants int,
  time_limit_minutes int,
  status text,
  share_token text,
  created_at timestamptz,
  started_at timestamptz,
  closes_at timestamptz,
  ballotage_option_ids uuid[],
  winner_option_ids uuid[],
  closed_at timestamptz,
  winner_label text
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.host_id,
    p.title,
    p.description,
    p.max_participants,
    p.time_limit_minutes,
    p.status,
    p.share_token,
    p.created_at,
    p.started_at,
    p.closes_at,
    p.ballotage_option_ids,
    p.winner_option_ids,
    p.closed_at,
    case
      when p.winner_option_ids is null or cardinality(p.winner_option_ids) = 0 then null
      when cardinality(p.winner_option_ids) > 1 then (
        select string_agg(po.text, ' · ' order by po.sort_order)
        from public.poll_options po
        where po.id = any (p.winner_option_ids)
      )
      else (
        select po.text
        from public.poll_options po
        where po.id = p.winner_option_ids[1]
      )
    end as winner_label
  from public.polls p
  inner join public.participants pt on pt.poll_id = p.id
  where pt.user_id = auth.uid()
    and p.host_id <> auth.uid()
  order by p.created_at desc;
$$;

grant execute on function public.get_participant_polls() to authenticated;

-- ---------------------------------------------------------------------------
-- Detalle de encuesta para participante (read-only en dashboard)
-- ---------------------------------------------------------------------------

create or replace function public.get_participant_poll(p_poll_id uuid)
returns public.polls
language sql
stable
security definer
set search_path = public
as $$
  select p.*
  from public.polls p
  inner join public.participants pt on pt.poll_id = p.id
  where p.id = p_poll_id
    and pt.user_id = auth.uid()
  limit 1;
$$;

grant execute on function public.get_participant_poll(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Vincular participante ghost a la cuenta autenticada
-- ---------------------------------------------------------------------------

create or replace function public.link_participant_to_user(p_participant_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_participant public.participants%rowtype;
  v_existing public.participants%rowtype;
begin
  if v_user_id is null then
    return jsonb_build_object(
      'success', false,
      'error', 'Tenés que iniciar sesión para vincular tu cuenta.'
    );
  end if;

  select *
  into v_participant
  from public.participants
  where id = p_participant_id;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error', 'No encontramos ese participante.'
    );
  end if;

  if v_participant.user_id is not null then
    if v_participant.user_id = v_user_id then
      return jsonb_build_object(
        'success', true,
        'participant_id', v_participant.id,
        'nickname', v_participant.nickname,
        'reconnected', true
      );
    end if;

    return jsonb_build_object(
      'success', false,
      'error', 'Este participante ya está vinculado a otra cuenta.'
    );
  end if;

  select *
  into v_existing
  from public.participants
  where poll_id = v_participant.poll_id
    and user_id = v_user_id;

  if found then
    return jsonb_build_object(
      'success', true,
      'participant_id', v_existing.id,
      'nickname', v_existing.nickname,
      'reconnected', true,
      'message', 'Ya participás en esta encuesta con tu cuenta.'
    );
  end if;

  update public.participants
  set user_id = v_user_id
  where id = p_participant_id
    and user_id is null;

  if not found then
    return jsonb_build_object(
      'success', false,
      'error', 'No pudimos vincular tu cuenta. Intentá de nuevo.'
    );
  end if;

  return jsonb_build_object(
    'success', true,
    'participant_id', p_participant_id,
    'nickname', v_participant.nickname,
    'linked', true
  );
end;
$$;

grant execute on function public.link_participant_to_user(uuid) to authenticated;

-- Fase 08: resultados, ballotage y cierre final

alter table public.polls
  add column if not exists ballotage_option_ids uuid[],
  add column if not exists winner_option_ids uuid[],
  add column if not exists closed_at timestamptz;

-- ---------------------------------------------------------------------------
-- Conteo de "sí" por opción en un round
-- ---------------------------------------------------------------------------

create or replace function public.get_yes_counts(p_poll_id uuid, p_round int)
returns table(option_id uuid, yes_count int)
language sql
stable
security definer
set search_path = public
as $$
  select
    v.option_id,
    count(*)::int as yes_count
  from public.votes v
  where v.poll_id = p_poll_id
    and v.round = p_round
    and v.value = true
  group by v.option_id;
$$;

grant execute on function public.get_yes_counts(uuid, int) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- calculate_results: determina ganador o activa ballotage
-- ---------------------------------------------------------------------------

create or replace function public.calculate_results(p_poll_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  poll_record public.polls%rowtype;
  max_yes int := 0;
  winner_ids uuid[];
  option_rec record;
  result_round int;
begin
  select * into poll_record from public.polls where id = p_poll_id;

  if not found then
    return jsonb_build_object('error', 'poll_not_found');
  end if;

  if poll_record.status = 'votando' then
    result_round := 1;
    winner_ids := array[]::uuid[];

    for option_rec in
      select po.id as option_id,
        coalesce(yc.yes_count, 0) as yes_count
      from public.poll_options po
      left join public.get_yes_counts(p_poll_id, 1) yc on yc.option_id = po.id
      where po.poll_id = p_poll_id
    loop
      if option_rec.yes_count > max_yes then
        max_yes := option_rec.yes_count;
        winner_ids := array[option_rec.option_id];
      elsif option_rec.yes_count = max_yes and max_yes > 0 then
        winner_ids := array_append(winner_ids, option_rec.option_id);
      elsif option_rec.yes_count = max_yes and max_yes = 0 then
        winner_ids := array_append(winner_ids, option_rec.option_id);
      end if;
    end loop;

    if array_length(winner_ids, 1) > 1 then
      update public.polls
      set
        status = 'ballotage',
        ballotage_option_ids = winner_ids,
        closes_at = case
          when time_limit_minutes is not null
            then now() + (time_limit_minutes || ' minutes')::interval
          else closes_at
        end
      where id = p_poll_id;

      return jsonb_build_object(
        'status', 'ballotage',
        'ballotage_option_ids', to_jsonb(winner_ids),
        'tied', true
      );
    end if;

    update public.polls
    set
      status = 'resultados',
      winner_option_ids = winner_ids,
      closed_at = now()
    where id = p_poll_id;

    return jsonb_build_object(
      'status', 'resultados',
      'winner_option_ids', to_jsonb(winner_ids),
      'tied', false
    );

  elsif poll_record.status = 'ballotage' then
    result_round := 2;
    max_yes := 0;
    winner_ids := array[]::uuid[];

    for option_rec in
      select po.id as option_id,
        coalesce(yc.yes_count, 0) as yes_count
      from public.poll_options po
      left join public.get_yes_counts(p_poll_id, 2) yc on yc.option_id = po.id
      where po.poll_id = p_poll_id
        and po.id = any(poll_record.ballotage_option_ids)
    loop
      if option_rec.yes_count > max_yes then
        max_yes := option_rec.yes_count;
        winner_ids := array[option_rec.option_id];
      elsif option_rec.yes_count = max_yes then
        winner_ids := array_append(winner_ids, option_rec.option_id);
      end if;
    end loop;

    update public.polls
    set
      status = 'resultados',
      winner_option_ids = winner_ids,
      closed_at = now()
    where id = p_poll_id;

    return jsonb_build_object(
      'status', 'resultados',
      'winner_option_ids', to_jsonb(winner_ids),
      'tied', coalesce(array_length(winner_ids, 1), 0) > 1
    );
  end if;

  return jsonb_build_object('status', poll_record.status);
end;
$$;

grant execute on function public.calculate_results(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Finalizar encuesta: resultados → cerrado
-- ---------------------------------------------------------------------------

create or replace function public.finalize_poll(p_poll_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  poll_record public.polls%rowtype;
begin
  select * into poll_record from public.polls where id = p_poll_id;

  if not found then
    return jsonb_build_object('error', 'poll_not_found');
  end if;

  if poll_record.status <> 'resultados' then
    return jsonb_build_object('status', poll_record.status, 'finalized', false);
  end if;

  update public.polls
  set status = 'cerrado'
  where id = p_poll_id;

  return jsonb_build_object('status', 'cerrado', 'finalized', true);
end;
$$;

grant execute on function public.finalize_poll(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Opciones filtradas para ballotage
-- ---------------------------------------------------------------------------

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
    and (
      p.status <> 'ballotage'
      or po.id = any(p.ballotage_option_ids)
    )
  order by po.sort_order asc;
$$;

-- ---------------------------------------------------------------------------
-- Resultados públicos (solo cuando resultados o cerrado)
-- ---------------------------------------------------------------------------

create or replace function public.get_poll_results(p_poll_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  poll_record public.polls%rowtype;
  result_round int;
  ranking jsonb;
begin
  select * into poll_record from public.polls where id = p_poll_id;

  if not found then
    return null;
  end if;

  if poll_record.status not in ('resultados', 'cerrado') then
    return null;
  end if;

  result_round := case
    when poll_record.winner_option_ids is not null
      and exists (select 1 from public.votes v where v.poll_id = p_poll_id and v.round = 2)
    then 2
    else 1
  end;

  select coalesce(jsonb_agg(row_data order by (row_data->>'yes_count')::int desc, row_data->>'sort_order'), '[]'::jsonb)
  into ranking
  from (
    select jsonb_build_object(
      'option_id', po.id,
      'text', po.text,
      'sort_order', po.sort_order,
      'yes_count', coalesce(yc.yes_count, 0),
      'is_winner', po.id = any(coalesce(poll_record.winner_option_ids, array[]::uuid[])),
      'yes_voters', coalesce(
        (
          select jsonb_agg(pt.nickname order by pt.nickname)
          from public.votes v2
          inner join public.participants pt on pt.id = v2.participant_id
          where v2.poll_id = p_poll_id
            and v2.option_id = po.id
            and v2.round = result_round
            and v2.value = true
        ),
        '[]'::jsonb
      )
    ) as row_data
    from public.poll_options po
    left join public.get_yes_counts(p_poll_id, result_round) yc on yc.option_id = po.id
    where po.poll_id = p_poll_id
      and (
        result_round = 1
        or po.id = any(coalesce(poll_record.ballotage_option_ids, array[]::uuid[]))
      )
  ) sub;

  return jsonb_build_object(
    'round', result_round,
    'is_tie', coalesce(array_length(poll_record.winner_option_ids, 1), 0) > 1,
    'winner_option_ids', to_jsonb(coalesce(poll_record.winner_option_ids, array[]::uuid[])),
    'ranking', ranking
  );
$$;

grant execute on function public.get_poll_results(uuid) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Vista host en vivo (solo host autenticado)
-- ---------------------------------------------------------------------------

create or replace function public.get_poll_live_stats(p_poll_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  poll_record public.polls%rowtype;
  vote_round int;
  option_count int;
  participants_json jsonb;
  partial_counts jsonb;
begin
  select * into poll_record from public.polls where id = p_poll_id;

  if not found then
    return null;
  end if;

  if poll_record.host_id <> auth.uid() then
    return null;
  end if;

  vote_round := case when poll_record.status = 'ballotage' then 2 else 1 end;

  option_count := case
    when poll_record.status = 'ballotage'
      then coalesce(array_length(poll_record.ballotage_option_ids, 1), 0)
    else (select count(*)::int from public.poll_options where poll_id = p_poll_id)
  end;

  select coalesce(jsonb_agg(row_data order by (row_data->>'joined_at')), '[]'::jsonb)
  into participants_json
  from (
    select jsonb_build_object(
      'id', pt.id,
      'nickname', pt.nickname,
      'joined_at', pt.joined_at,
      'has_voted', (
        select count(*)::int >= option_count
        from public.votes v
        where v.participant_id = pt.id
          and v.round = vote_round
          and (
            vote_round = 1
            or v.option_id = any(coalesce(poll_record.ballotage_option_ids, array[]::uuid[]))
          )
      ),
      'votes', (
        select coalesce(jsonb_agg(
          jsonb_build_object(
            'option_id', v.option_id,
            'value', v.value,
            'round', v.round
          ) order by v.created_at
        ), '[]'::jsonb)
        from public.votes v
        where v.participant_id = pt.id
          and v.round = vote_round
      )
    ) as row_data
    from public.participants pt
    where pt.poll_id = p_poll_id
  ) sub;

  select coalesce(jsonb_agg(row_data order by (row_data->>'sort_order')::int), '[]'::jsonb)
  into partial_counts
  from (
    select jsonb_build_object(
      'option_id', po.id,
      'text', po.text,
      'sort_order', po.sort_order,
      'yes_count', coalesce(yc.yes_count, 0),
      'no_count', coalesce(nc.no_count, 0)
    ) as row_data
    from public.poll_options po
    left join public.get_yes_counts(p_poll_id, vote_round) yc on yc.option_id = po.id
    left join (
      select v.option_id, count(*)::int as no_count
      from public.votes v
      where v.poll_id = p_poll_id and v.round = vote_round and v.value = false
      group by v.option_id
    ) nc on nc.option_id = po.id
    where po.poll_id = p_poll_id
      and (
        vote_round = 1
        or po.id = any(coalesce(poll_record.ballotage_option_ids, array[]::uuid[]))
      )
  ) sub;

  return jsonb_build_object(
    'status', poll_record.status,
    'participant_count', (select count(*)::int from public.participants where poll_id = p_poll_id),
    'max_participants', poll_record.max_participants,
    'voted_count', (
      select count(*)::int
      from public.participants pt
      where pt.poll_id = p_poll_id
        and (
          select count(*)::int
          from public.votes v
          where v.participant_id = pt.id
            and v.round = vote_round
            and (
              vote_round = 1
              or v.option_id = any(coalesce(poll_record.ballotage_option_ids, array[]::uuid[]))
            )
        ) >= option_count
    ),
    'round', vote_round,
    'participants', participants_json,
    'partial_counts', partial_counts
  );
$$;

grant execute on function public.get_poll_live_stats(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Actualizar check_and_close_poll con lógica de resultados/ballotage
-- ---------------------------------------------------------------------------

create or replace function public.check_and_close_poll(p_poll_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  poll_record public.polls%rowtype;
  participant_count int;
  voted_count int;
  option_count int;
  vote_round int;
  should_close boolean := false;
  close_reason text := null;
  calc_result jsonb;
begin
  select * into poll_record from public.polls where id = p_poll_id;

  if not found then
    return jsonb_build_object('closed', false, 'error', 'poll_not_found');
  end if;

  if poll_record.status not in ('votando', 'ballotage') then
    return jsonb_build_object('closed', false, 'status', poll_record.status);
  end if;

  vote_round := case when poll_record.status = 'ballotage' then 2 else 1 end;

  if poll_record.closes_at is not null and now() > poll_record.closes_at then
    should_close := true;
    close_reason := 'time_limit';
  end if;

  if not should_close then
    option_count := case
      when poll_record.status = 'ballotage'
        then coalesce(array_length(poll_record.ballotage_option_ids, 1), 0)
      else (select count(*)::int from public.poll_options where poll_id = p_poll_id)
    end;

    if option_count = 0 then
      return jsonb_build_object('closed', false, 'status', poll_record.status);
    end if;

    select count(*)::int into participant_count
    from public.participants
    where poll_id = p_poll_id;

    if participant_count = 0 then
      return jsonb_build_object('closed', false, 'status', poll_record.status);
    end if;

    select count(*)::int into voted_count
    from public.participants pt
    where pt.poll_id = p_poll_id
      and (
        select count(*)::int
        from public.votes v
        where v.participant_id = pt.id
          and v.round = vote_round
          and (
            vote_round = 1
            or v.option_id = any(coalesce(poll_record.ballotage_option_ids, array[]::uuid[]))
          )
      ) >= option_count;

    if voted_count >= participant_count then
      should_close := true;
      close_reason := 'all_voted';
    end if;
  end if;

  if should_close then
    calc_result := public.calculate_results(p_poll_id);

    return jsonb_build_object(
      'closed', (calc_result->>'status') <> 'ballotage',
      'status', calc_result->>'status',
      'reason', close_reason,
      'ballotage', (calc_result->>'status') = 'ballotage',
      'tied', coalesce((calc_result->>'tied')::boolean, false)
    );
  end if;

  return jsonb_build_object('closed', false, 'status', poll_record.status);
end;
$$;

-- Participantes no ven votos parciales hasta resultados
drop policy if exists "Participantes leen votos de la encuesta" on public.votes;

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
      and p.status in ('resultados', 'cerrado')
  );
$$;

create policy "Participantes leen votos de la encuesta"
  on public.votes for select
  to anon, authenticated
  using (public.can_read_poll_votes(poll_id));

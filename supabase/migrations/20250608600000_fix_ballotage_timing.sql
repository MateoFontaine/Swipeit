-- Ballotage solo si hay empate en el MÁXIMO de "sí" (> 0) al cerrar la ronda.
-- No se analiza nada hasta que todos votaron (eso lo controla check_and_close_poll).

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
begin
  select * into poll_record from public.polls where id = p_poll_id;

  if not found then
    return jsonb_build_object('error', 'poll_not_found');
  end if;

  if poll_record.status = 'votando' then
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
      end if;
    end loop;

    -- Empate en el primer lugar con al menos un "sí" → ballotage
    if max_yes > 0 and coalesce(array_length(winner_ids, 1), 0) > 1 then
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
      'tied', coalesce(array_length(winner_ids, 1), 0) > 1 or max_yes = 0
    );

  elsif poll_record.status = 'ballotage' then
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
      elsif option_rec.yes_count = max_yes and max_yes > 0 then
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
      'tied', coalesce(array_length(winner_ids, 1), 0) > 1 or max_yes = 0
    );
  end if;

  return jsonb_build_object('status', poll_record.status);
end;
$$;

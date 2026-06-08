-- Fase 07: cierre automático de encuesta (todos votaron o tiempo cumplido)

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
    select count(*)::int into option_count
    from public.poll_options
    where poll_id = p_poll_id;

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
      ) >= option_count;

    if voted_count >= participant_count then
      should_close := true;
      close_reason := 'all_voted';
    end if;
  end if;

  if should_close then
    update public.polls
    set status = 'resultados'
    where id = p_poll_id;

    return jsonb_build_object(
      'closed', true,
      'status', 'resultados',
      'reason', close_reason
    );
  end if;

  return jsonb_build_object('closed', false, 'status', poll_record.status);
end;
$$;

grant execute on function public.check_and_close_poll(uuid) to anon, authenticated;

-- Fix: anon no podía leer filas de polls dentro de la policy SELECT de
-- participants, así que INSERT … RETURNING fallaba con error de RLS.

create or replace function public.can_read_participants(p_poll_id uuid)
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
      and (
        p.status <> 'cerrado'
        or p.host_id = auth.uid()
      )
  );
$$;

grant execute on function public.can_read_participants(uuid) to anon, authenticated;

drop policy if exists "Leer participantes de encuestas accesibles" on public.participants;

create policy "Leer participantes de encuestas accesibles"
  on public.participants for select
  to anon, authenticated
  using (
    public.can_read_participants(poll_id)
    or user_id = auth.uid()
  );

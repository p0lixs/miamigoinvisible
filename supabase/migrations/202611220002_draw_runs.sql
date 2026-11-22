-- Ejecutar una vez, despues de 202611220001_drafts.sql.
-- Generacion en servidor y consulta exclusivamente del resultado propio.
begin;

create schema draw_private;
revoke all on schema draw_private from public, anon, authenticated;

alter table public.draws drop constraint draws_status_check;
alter table public.draws add constraint draws_status_check check (status in ('draft', 'drawn'));
alter table public.draws add column drawn_at timestamptz;
alter table public.draws add constraint draws_drawn_at_check check ((status = 'drawn') = (drawn_at is not null));
grant select (drawn_at) on public.draws to authenticated;

create table draw_private.runs (
  draw_id uuid primary key references public.draws(id) on delete cascade,
  request_id uuid not null,
  input_version integer not null,
  algorithm text not null default 'augmenting-path-v1',
  created_at timestamptz not null default now()
);
create table draw_private.assignments (
  draw_id uuid not null references draw_private.runs(draw_id) on delete cascade,
  giver_id uuid not null,
  recipient_id uuid not null,
  primary key (draw_id, giver_id),
  unique (draw_id, recipient_id),
  foreign key (draw_id, giver_id) references public.draw_participants(draw_id, id),
  foreign key (draw_id, recipient_id) references public.draw_participants(draw_id, id),
  check (giver_id <> recipient_id)
);
alter table draw_private.runs enable row level security;
alter table draw_private.assignments enable row level security;
revoke all on draw_private.runs, draw_private.assignments from public, anon, authenticated;

-- Conservar la implementacion de borradores probada, ahora detras de una
-- envoltura que bloquea cualquier reintento de edicion despues de sortear.
alter function public.save_draw_draft(uuid, uuid, integer, uuid, jsonb) set schema draw_private;
revoke all on function draw_private.save_draw_draft(uuid, uuid, integer, uuid, jsonb) from public, anon, authenticated;
create function public.save_draw_draft(p_draw_id uuid, p_owner_id uuid, p_expected_version integer, p_request_id uuid, p_draft jsonb)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare current_status text;
begin
  if auth.uid() is null or p_owner_id is distinct from auth.uid() then
    raise exception using errcode = '42501', message = 'DRAW_FORBIDDEN';
  end if;
  select status into current_status from public.draws where id = p_draw_id and owner_id = auth.uid() for update;
  if found and current_status <> 'draft' then
    raise exception using errcode = '22023', message = 'DRAW_LOCKED';
  end if;
  return draw_private.save_draw_draft(p_draw_id, p_owner_id, p_expected_version, p_request_id, p_draft);
end;
$$;
revoke all on function public.save_draw_draft(uuid, uuid, integer, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_draw_draft(uuid, uuid, integer, uuid, jsonb) to authenticated;

create function public.generate_draw(p_draw_id uuid, p_owner_id uuid, p_expected_version integer, p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  d public.draws%rowtype;
  ids uuid[];
  n integer;
  allowed boolean[];
  recipient_giver integer[];
  giver_recipient integer[];
  seen boolean[];
  predecessor integer[];
  queue integer[];
  head integer;
  root_g integer;
  current_g integer;
  candidate_r integer;
  free_r integer;
  previous_r integer;
begin
  if auth.uid() is null or p_owner_id is distinct from auth.uid() then
    raise exception using errcode = '42501', message = 'DRAW_FORBIDDEN';
  end if;
  if p_expected_version is null or p_expected_version < 1 or p_request_id is null then
    raise exception using errcode = '22023', message = 'DRAW_INVALID_REQUEST';
  end if;
  select * into d from public.draws where id = p_draw_id and owner_id = auth.uid() for update;
  if not found then raise exception using errcode = '42501', message = 'DRAW_FORBIDDEN'; end if;
  -- Una entidad solo se ejecuta una vez. Incluso otro request_id conserva el
  -- resultado original: reintentar nunca vuelve a sortear.
  if d.status = 'drawn' then
    return jsonb_build_object('id', d.id, 'version', d.version, 'status', d.status, 'drawn_at', d.drawn_at);
  end if;
  if d.version <> p_expected_version then raise exception using errcode = '40001', message = 'DRAW_CHANGED'; end if;
  select array_agg(id order by position), count(*) into ids, n from public.draw_participants where draw_id = d.id;
  if n < 3 or n > 100 or btrim(d.title) = '' or d.budget_cents is null or d.budget_cents <= 0 then
    raise exception using errcode = '22023', message = 'DRAW_INCOMPLETE';
  end if;
  allowed := array(
    select g.person_id <> r.person_id and not exists (
      select 1 from public.draw_exclusions e where e.draw_id = d.id and e.giver_id = g.person_id and e.recipient_id = r.person_id
    ) from unnest(ids) with ordinality g(person_id, position)
      cross join unnest(ids) with ordinality r(person_id, position)
      order by g.position, r.position
  );
  recipient_giver := array_fill(0, array[n]);
  giver_recipient := array_fill(0, array[n]);
  -- Emparejamiento bipartito con caminos aumentantes. Aleatorizar el orden
  -- permite soluciones distintas; no presupone un unico ciclo ni prohibe
  -- parejas reciprocas. El coste esta acotado por el limite de 100 personas.
  for root_g in select v from generate_series(1, n) v order by gen_random_uuid() loop
    seen := array_fill(false, array[n]);
    predecessor := array_fill(0, array[n]);
    queue := array[root_g]; head := 1; free_r := 0;
    while head <= cardinality(queue) and free_r = 0 loop
      current_g := queue[head]; head := head + 1;
      for candidate_r in select v from generate_series(1, n) v
        where allowed[(current_g - 1) * n + v] and not seen[v] order by gen_random_uuid()
      loop
        seen[candidate_r] := true;
        predecessor[candidate_r] := current_g;
        if recipient_giver[candidate_r] = 0 then free_r := candidate_r; exit; end if;
        queue := array_append(queue, recipient_giver[candidate_r]);
      end loop;
    end loop;
    if free_r = 0 then raise exception using errcode = '22023', message = 'DRAW_IMPOSSIBLE'; end if;
    loop
      current_g := predecessor[free_r];
      previous_r := giver_recipient[current_g];
      giver_recipient[current_g] := free_r;
      recipient_giver[free_r] := current_g;
      exit when previous_r = 0;
      free_r := previous_r;
    end loop;
  end loop;
  insert into draw_private.runs(draw_id, request_id, input_version) values (d.id, p_request_id, d.version);
  insert into draw_private.assignments(draw_id, giver_id, recipient_id)
    select d.id, ids[v], ids[giver_recipient[v]] from generate_series(1, n) v;
  update public.draws set status = 'drawn', drawn_at = now(), version = version + 1, updated_at = now()
    where id = d.id returning * into d;
  -- Solo metadatos. Nunca devolver el mapa de asignaciones al organizador.
  return jsonb_build_object('id', d.id, 'version', d.version, 'status', d.status, 'drawn_at', d.drawn_at);
end;
$$;
revoke all on function public.generate_draw(uuid, uuid, integer, uuid) from public, anon, authenticated;
grant execute on function public.generate_draw(uuid, uuid, integer, uuid) to authenticated;

create function public.get_my_draw_result(p_draw_id uuid, p_account_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  verified_email text;
  result jsonb;
begin
  if auth.uid() is null or p_account_id is distinct from auth.uid() then
    raise exception using errcode = '42501', message = 'DRAW_FORBIDDEN';
  end if;
  -- Identidad comprobada en Auth; ni el correo enviado por el cliente ni los
  -- metadatos editables del usuario deciden a quien pertenece un resultado.
  select lower(btrim(email)) into verified_email from auth.users
    where id = auth.uid() and email_confirmed_at is not null;
  if verified_email is null then raise exception using errcode = '42501', message = 'DRAW_VERIFICATION_REQUIRED'; end if;
  select jsonb_build_object('available', true, 'title', d.title, 'description', d.description,
    'budgetCents', d.budget_cents, 'currency', d.currency, 'date', coalesce(d.exchange_date::text, ''),
    'recipientName', recipient.name)
    into result
    from public.draws d
    join public.draw_participants giver on giver.draw_id = d.id and giver.email_normalized = verified_email
    join draw_private.assignments a on a.draw_id = d.id and a.giver_id = giver.id
    join public.draw_participants recipient on recipient.draw_id = d.id and recipient.id = a.recipient_id
    where d.id = p_draw_id and d.status = 'drawn';
  -- Igual para sorteo ajeno, inexistente, no realizado o cuenta no participante.
  return coalesce(result, jsonb_build_object('available', false));
end;
$$;
revoke all on function public.get_my_draw_result(uuid, uuid) from public, anon, authenticated;
grant execute on function public.get_my_draw_result(uuid, uuid) to authenticated;
notify pgrst, 'reload schema';
commit;

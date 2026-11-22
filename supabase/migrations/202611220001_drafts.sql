-- Borradores privados. No contiene asignaciones, deseos ni accesos de invitados.
begin;

create table public.draws (
  id uuid primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (length(title) <= 100),
  description text not null check (length(description) <= 1000),
  budget_cents integer check (budget_cents between 1 and 99999999),
  currency text not null default 'EUR' check (currency = 'EUR'),
  exchange_date date,
  status text not null default 'draft' check (status = 'draft'),
  color text not null check (color in ('blue', 'coral', 'mint')),
  version integer not null check (version > 0),
  last_request_id uuid not null,
  last_payload_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index draws_owner_updated on public.draws(owner_id, updated_at desc);

create table public.draw_participants (
  draw_id uuid not null references public.draws(id) on delete cascade,
  id uuid not null,
  name text not null check (length(btrim(name)) between 1 and 80),
  email text not null check (length(email) <= 254 and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  email_normalized text generated always as (lower(btrim(email))) stored,
  position integer not null check (position between 0 and 99),
  primary key (draw_id, id),
  unique (draw_id, email_normalized),
  unique (draw_id, position)
);
create table public.draw_exclusions (
  draw_id uuid not null references public.draws(id) on delete cascade,
  giver_id uuid not null,
  recipient_id uuid not null,
  primary key (draw_id, giver_id, recipient_id),
  foreign key (draw_id, giver_id) references public.draw_participants(draw_id, id) on delete cascade,
  foreign key (draw_id, recipient_id) references public.draw_participants(draw_id, id) on delete cascade,
  check (giver_id <> recipient_id)
);

alter table public.draws enable row level security;
alter table public.draw_participants enable row level security;
alter table public.draw_exclusions enable row level security;

create policy draws_owner_read on public.draws for select to authenticated
  using (owner_id = (select auth.uid()));
create policy participants_owner_read on public.draw_participants for select to authenticated
  using (exists (select 1 from public.draws d where d.id = draw_id and d.owner_id = (select auth.uid())));
create policy exclusions_owner_read on public.draw_exclusions for select to authenticated
  using (exists (select 1 from public.draws d where d.id = draw_id and d.owner_id = (select auth.uid())));

revoke all on public.draws, public.draw_participants, public.draw_exclusions from public, anon, authenticated;
-- No se exponen los identificadores de reintento ni el hash de la petición.
grant select (id, owner_id, title, description, budget_cents, currency, exchange_date, status, color, version, created_at, updated_at) on public.draws to authenticated;
grant select on public.draw_participants, public.draw_exclusions to authenticated;

-- Una transacción sustituye la configuración completa de un borrador.
-- El propietario se deriva de la sesión; p_owner_id solo impide mezclar cuentas
-- si el usuario cambia de sesión mientras una petición está pendiente.
create function public.save_draw_draft(
  p_draw_id uuid,
  p_owner_id uuid,
  p_expected_version integer,
  p_request_id uuid,
  p_draft jsonb
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  existing public.draws%rowtype;
  inserted boolean;
  payload_hash text;
  item jsonb;
begin
  if actor is null or p_owner_id is distinct from actor then
    raise exception using errcode = '42501', message = 'Acceso no autorizado';
  end if;
  if p_draw_id is null or p_request_id is null or p_expected_version is null or p_expected_version < 0 then
    raise exception using errcode = '22023', message = 'Peticion no valida';
  end if;
  if jsonb_typeof(p_draft) is distinct from 'object'
    or pg_column_size(p_draft) > 2000000
    or not (p_draft ?& array['title','description','budgetCents','date','color','participants','exclusions'])
    or (p_draft - array['title','description','budgetCents','date','color','participants','exclusions']) <> '{}'::jsonb
    or jsonb_typeof(p_draft->'title') is distinct from 'string'
    or jsonb_typeof(p_draft->'description') is distinct from 'string'
    or jsonb_typeof(p_draft->'date') is distinct from 'string'
    or jsonb_typeof(p_draft->'color') is distinct from 'string'
    or jsonb_typeof(p_draft->'participants') is distinct from 'array'
    or jsonb_typeof(p_draft->'exclusions') is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Configuracion no valida';
  end if;
  if jsonb_array_length(p_draft->'participants') > 100
    or jsonb_array_length(p_draft->'exclusions') > 9900
    or length(p_draft->>'title') > 100 or length(p_draft->>'description') > 1000
    or p_draft->>'color' not in ('blue','coral','mint') then
    raise exception using errcode = '22023', message = 'Limites del borrador excedidos';
  end if;
  if p_draft->'budgetCents' <> 'null'::jsonb then
    if jsonb_typeof(p_draft->'budgetCents') <> 'number'
      or (p_draft->>'budgetCents') !~ '^[0-9]{1,8}$' then
      raise exception using errcode = '22023', message = 'Presupuesto no valido';
    end if;
    if (p_draft->>'budgetCents')::integer not between 1 and 99999999 then
      raise exception using errcode = '22023', message = 'Presupuesto no valido';
    end if;
  end if;
  if p_draft->>'date' <> '' then
    if (p_draft->>'date') !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$'
      or to_char((p_draft->>'date')::date, 'YYYY-MM-DD') <> p_draft->>'date' then
      raise exception using errcode = '22023', message = 'Fecha no valida';
    end if;
  end if;
  for item in select value from jsonb_array_elements(p_draft->'participants') loop
    if jsonb_typeof(item) <> 'object' or not (item ?& array['id','name','email'])
      or (item - array['id','name','email']) <> '{}'::jsonb
      or jsonb_typeof(item->'id') is distinct from 'string'
      or jsonb_typeof(item->'name') is distinct from 'string'
      or jsonb_typeof(item->'email') is distinct from 'string' then
      raise exception using errcode = '22023', message = 'Participante no valido';
    end if;
  end loop;
  for item in select value from jsonb_array_elements(p_draft->'exclusions') loop
    if jsonb_typeof(item) <> 'object' or not (item ?& array['giverId','recipientId'])
      or (item - array['giverId','recipientId']) <> '{}'::jsonb
      or jsonb_typeof(item->'giverId') is distinct from 'string'
      or jsonb_typeof(item->'recipientId') is distinct from 'string' then
      raise exception using errcode = '22023', message = 'Excepcion no valida';
    end if;
  end loop;
  payload_hash := md5(p_draft::text);

  -- Serializar las ediciones de una fila existente.
  select * into existing from public.draws where id = p_draw_id and owner_id = actor for update;
  inserted := false;
  if not found and p_expected_version = 0 then
    insert into public.draws(id, owner_id, title, description, budget_cents, exchange_date, color, version, last_request_id, last_payload_hash)
      values (p_draw_id, actor, btrim(p_draft->>'title'), btrim(p_draft->>'description'),
        (p_draft->>'budgetCents')::integer, nullif(p_draft->>'date','')::date, p_draft->>'color', 1, p_request_id, payload_hash)
      on conflict (id) do nothing returning * into existing;
    inserted := found;
    if not inserted then
      select * into existing from public.draws where id = p_draw_id and owner_id = actor for update;
    end if;
  end if;
  if existing.id is null then
    -- La misma respuesta para identificadores ajenos o inexistentes.
    raise exception using errcode = '42501', message = 'Borrador no disponible';
  end if;
  if not inserted then
    if existing.last_request_id = p_request_id and existing.last_payload_hash = payload_hash then
      return jsonb_build_object('id', existing.id, 'version', existing.version);
    end if;
    if existing.last_request_id = p_request_id or existing.version <> p_expected_version then
      raise exception using errcode = '40001', message = 'El borrador ha cambiado';
    end if;
    if existing.status <> 'draft' then
      raise exception using errcode = '42501', message = 'El sorteo no admite cambios';
    end if;
    update public.draws set title = btrim(p_draft->>'title'), description = btrim(p_draft->>'description'),
      budget_cents = (p_draft->>'budgetCents')::integer, exchange_date = nullif(p_draft->>'date','')::date,
      color = p_draft->>'color', version = version + 1, updated_at = now(),
      last_request_id = p_request_id, last_payload_hash = payload_hash
      where id = p_draw_id returning * into existing;
  end if;
  delete from public.draw_exclusions where draw_id = p_draw_id;
  delete from public.draw_participants where draw_id = p_draw_id;
  insert into public.draw_participants(draw_id, id, name, email, position)
    select p_draw_id, (value->>'id')::uuid, btrim(value->>'name'), btrim(value->>'email'), (ordinality - 1)::integer
    from jsonb_array_elements(p_draft->'participants') with ordinality;
  insert into public.draw_exclusions(draw_id, giver_id, recipient_id)
    select p_draw_id, (value->>'giverId')::uuid, (value->>'recipientId')::uuid
    from jsonb_array_elements(p_draft->'exclusions');
  return jsonb_build_object('id', existing.id, 'version', existing.version);
end;
$$;
revoke all on function public.save_draw_draft(uuid, uuid, integer, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.save_draw_draft(uuid, uuid, integer, uuid, jsonb) to authenticated;
notify pgrst, 'reload schema';
commit;

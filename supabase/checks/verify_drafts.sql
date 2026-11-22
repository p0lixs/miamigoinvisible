-- Ejecutar en SQL Editor despues de 202611220001_drafts.sql.
-- Solo lectura de catalogos y permisos: no muestra participantes ni modifica datos.
-- Todas las filas deben tener correcto = true. No sustituye las pruebas entre cuentas.
with targets(name, policy_name) as (
  values ('draws', 'draws_owner_read'),
         ('draw_participants', 'participants_owner_read'),
         ('draw_exclusions', 'exclusions_owner_read')
), tables as (
  select t.*, c.oid, c.relrowsecurity
  from targets t
  left join pg_namespace n on n.nspname = 'public'
  left join pg_class c on c.relnamespace = n.oid and c.relname = t.name and c.relkind = 'r'
), checks as (
  select name || ': tabla con RLS' as comprobacion,
    coalesce(relrowsecurity, false) as correcto from tables
  union all
  select name || ': politica SELECT del propietario',
    (select count(*) = 1 and bool_and(p.polname = t.policy_name and p.polcmd = 'r'
      and p.polroles = array[(select oid from pg_roles where rolname = 'authenticated')])
     from pg_policy p where p.polrelid = t.oid)
    from tables t
  union all
  select name || ': sin acceso anonimo',
    not coalesce(has_any_column_privilege('anon', oid, 'SELECT'), true)
    and not coalesce(has_table_privilege('anon', oid, 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'), true)
    from tables
  union all
  select name || ': sin escritura directa de authenticated',
    not coalesce(has_table_privilege('authenticated', oid, 'INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER'), true)
    and not coalesce(has_any_column_privilege('authenticated', oid, 'INSERT,UPDATE,REFERENCES'), true)
    from tables
  union all
  select name || ': lectura de authenticated',
    coalesce(case when name = 'draws' then
      (select count(*) = 12 and bool_and(has_column_privilege('authenticated', t.oid, a.attnum, 'SELECT'))
       from pg_attribute a where a.attrelid = t.oid and a.attname in
        ('id','owner_id','title','description','budget_cents','currency','exchange_date','status','color','version','created_at','updated_at'))
      else has_table_privilege('authenticated', oid, 'SELECT') end, false)
    from tables t
  union all
  select 'draws: control de reintentos privado',
    (select count(*) = 2 and bool_and(not has_column_privilege('authenticated', t.oid, a.attnum, 'SELECT'))
     from tables t join pg_attribute a on a.attrelid = t.oid
     where t.name = 'draws' and a.attname in ('last_request_id','last_payload_hash'))
  union all
  select 'save_draw_draft: funcion y permisos', exists (
    select 1 from pg_proc p
    where p.oid = to_regprocedure('public.save_draw_draft(uuid,uuid,integer,uuid,jsonb)')
      and p.prosecdef and p.proconfig @> array['search_path=""']
      and has_function_privilege('authenticated', p.oid, 'EXECUTE')
      and not has_function_privilege('anon', p.oid, 'EXECUTE')
  )
)
select comprobacion, coalesce(correcto, false) as correcto
from checks order by comprobacion;

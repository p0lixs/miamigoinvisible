-- Solo lectura, despues de 202611220002_draw_runs.sql. No muestra asignaciones.
with private_tables(name) as (values ('runs'), ('assignments')),
tables as (
  select t.name, c.oid, c.relrowsecurity from private_tables t
  left join pg_namespace n on n.nspname = 'draw_private'
  left join pg_class c on c.relnamespace = n.oid and c.relname = t.name and c.relkind = 'r'
), functions(signature) as (values
  ('public.generate_draw(uuid,uuid,integer,uuid)'),
  ('public.get_my_draw_result(uuid,uuid)'),
  ('public.save_draw_draft(uuid,uuid,integer,uuid,jsonb)')
), checks as (
  select 'draw_private.' || name || ': RLS activo' as comprobacion, coalesce(relrowsecurity, false) as correcto from tables
  union all
  select 'draw_private.' || name || ': sin acceso a tablas',
    not coalesce(has_table_privilege('authenticated', oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE'), true)
    and not coalesce(has_table_privilege('anon', oid, 'SELECT,INSERT,UPDATE,DELETE,TRUNCATE'), true)
    and not coalesce(has_any_column_privilege('authenticated', oid, 'SELECT,INSERT,UPDATE'), true)
    and not coalesce(has_any_column_privilege('anon', oid, 'SELECT,INSERT,UPDATE'), true)
    from tables
  union all
  select 'draw_private: esquema privado', exists (
    select 1 from pg_namespace n where n.nspname = 'draw_private'
      and not has_schema_privilege('authenticated', n.oid, 'USAGE')
      and not has_schema_privilege('anon', n.oid, 'USAGE')
  )
  union all
  select signature || ': permisos y search_path', exists (
    select 1 from pg_proc p where p.oid = to_regprocedure(signature) and p.prosecdef
      and p.proconfig @> array['search_path=""']
      and has_function_privilege('authenticated', p.oid, 'EXECUTE')
      and not has_function_privilege('anon', p.oid, 'EXECUTE')
  ) from functions
  union all
  select 'draw_private.save_draw_draft: funcion interna', exists (
    select 1 from pg_proc p where p.oid = to_regprocedure('draw_private.save_draw_draft(uuid,uuid,integer,uuid,jsonb)')
      and not has_function_privilege('authenticated', p.oid, 'EXECUTE')
      and not has_function_privilege('anon', p.oid, 'EXECUTE')
  )
)
select comprobacion, coalesce(correcto, false) as correcto from checks order by comprobacion;

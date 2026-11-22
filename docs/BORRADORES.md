# Borradores privados en Supabase

La aplicación tiene implementados la carga, creación, edición y copia de borradores de la cuenta. El usuario confirma que ha ejecutado la migración en Supabase el 22 de noviembre de 2026. La API reconoce las tres tablas y rechaza consultas anónimas con HTTP 401 y código `42501`, sin leer filas. Falta publicar el código local de esta entrega y validar las operaciones con sesiones reales.

## Alcance

Con sesión de Google, la lista comienza vacía y carga exclusivamente los borradores del organizador. Sin sesión se conserva la demo local de Ana. Iniciar sesión no importa los ejemplos, y cerrar o cambiar de cuenta desmonta el almacén y los formularios anteriores. Los borradores reales no se guardan en AsyncStorage ni se usan como sustituto de una carga fallida.

Se pueden guardar borradores incompletos: título vacío, presupuesto aún sin definir y menos de tres participantes. Los participantes añadidos deben tener nombres y correos válidos y distintos. La revisión previa al sorteo sigue exigiendo título, presupuesto positivo y entre 3 y 100 personas. EUR, fecha opcional y listas vacías al copiar continúan siendo supuestos provisionales, no nuevas decisiones del usuario.

«Guardar y salir» espera la confirmación del servidor. Ante un error, no navega ni presenta el borrador como guardado; mantiene el formulario abierto para reintentar. Si hay una persona escrita sin añadir, pide añadirla o vaciar esos campos antes de guardar. «Actualizar mis sorteos» vuelve a consultar la cuenta; todavía no hay sincronización en tiempo real entre dispositivos ni edición sin conexión.

Copiar crea identificadores nuevos para el sorteo y sus participantes y remapea las excepciones. No hereda versión, resultados, deseos, fotografías ni accesos. Un reintento de la misma copia pendiente reutiliza el borrador generado para evitar duplicados tras una respuesta perdida.

## Migración y acceso

Archivo: [202611220001_drafts.sql](../supabase/migrations/202611220001_drafts.sql).

| Recurso | Función | Acceso de la app |
| --- | --- | --- |
| `draws` | Propietario, configuración, estado de borrador, versión y control del último reintento | Lectura de columnas explícitas con RLS |
| `draw_participants` | Personas, correo normalizado y posición | Lectura con RLS del propietario del borrador |
| `draw_exclusions` | Parejas dirigidas del mismo grupo | Lectura con RLS del propietario del borrador |
| `save_draw_draft` | Guardado transaccional de la configuración completa | Ejecución solo para `authenticated` |

Las tablas no conceden escritura directa a `authenticated` ni acceso a `anon`. Tampoco se exponen el identificador del último reintento ni el hash de su contenido. La función `SECURITY DEFINER` fija un `search_path` vacío, usa nombres cualificados, deriva el propietario de `auth.uid()` y compara `p_owner_id` con esa identidad. Este último parámetro evita atribuir a otra cuenta una petición que estaba pendiente al cambiar de sesión; no permite elegir propietario.

El guardado bloquea la fila y exige la versión esperada. Una versión antigua produce un conflicto y conserva los datos del servidor. La misma petición y contenido ya confirmados devuelven la versión guardada; reutilizar la petición con contenido distinto se rechaza. Un fallo al insertar participantes o excepciones revierte también los cambios de título, presupuesto y versión.

Los correos normalizados son únicos por grupo. Las claves foráneas compuestas impiden excepciones que usen personas de otro grupo y las restricciones impiden autoexclusiones y parejas dirigidas repetidas. La opción mutua del formulario guarda dos excepciones; no se infiere reciprocidad. No hay restricciones que prohíban futuras parejas recíprocas de regalos.

La API acepta exclusivamente configuración, participantes y excepciones. No acepta estado sorteado, propietario, deseos, asignaciones ni identidad de participante en el contenido. «Yo también participo» usa el nombre y correo de la sesión para rellenar el formulario; la coincidencia de correo solo etiqueta al organizador en este borrador y no concede acceso a deseos ni resultados.

La sustitución completa de participantes es válida en este alcance, donde aún no existen invitaciones ni deseos de servidor. Antes de incorporarlos habrá que ampliar la transacción con las reglas de revocación y conservación correspondientes. El único estado admitido por esta primera migración es `draft`.

## Aplicación al proyecto de desarrollo

El usuario ha optado por ejecutar el SQL desde el panel, sin depender de instalar la integración de gestión, y confirma la migración aplicada al proyecto `osuagtuwrgohzrnmrgel`. La librería `@supabase/supabase-js` ya está instalada en la aplicación; la integración de gestión es una herramienta opcional para administrar el proyecto desde el agente.

La migración de creación se ejecuta una sola vez; no volver a pegarla si las tablas ya existen. Para comprobar el catálogo y los permisos, abrir el proyecto → **SQL Editor → New query**, pegar [verify_drafts.sql](../supabase/checks/verify_drafts.sql) completo y pulsar **Run**, según el [procedimiento del panel](https://supabase.com/docs/guides/database/functions). Deben aparecer 17 filas con `correcto = true`. El verificador se puede repetir: no cambia tablas ni lee participantes. Comprueba la presencia de RLS, la configuración básica de políticas y los privilegios; no sustituye las pruebas funcionales entre cuentas.

Después publicar el código de la app en Vercel. No hacen falta nuevas variables públicas ni claves privilegiadas en el cliente. Ejecutar SQL manualmente no registra por sí mismo el historial de la CLI: antes de introducir despliegues mediante CLI, conciliar el historial con esta aplicación manual para no intentar crear las tablas otra vez.

## Verificación y límites

### Corrección de carga por relaciones ambiguas

El usuario ha detectado `PGRST201` al cargar «Mis sorteos» con su cuenta. PostgREST encuentra la relación directa entre `draws` y `draw_participants`, además de rutas de muchos a muchos mediante `draw_exclusions`. La consulta sin desambiguar no permitía cargar ni siquiera una lista vacía.

La consulta del repositorio fija las claves `draw_participants_draw_id_fkey` y `draw_exclusions_draw_id_fkey`, con alias para conservar los nombres de las propiedades de la respuesta. Se utiliza la [sintaxis de FK explícita de PostgREST](https://docs.postgrest.org/en/stable/references/api/resource_embedding.html#foreign-key-joins-on-multiple-foreign-key-relationships). El cambio está en el cliente y no requiere ejecutar SQL ni modificar permisos.

Se ha reproducido el fallo en la API real con Publishable key, sin sesión y `limit=0`: la consulta anterior devuelve HTTP 300 con `PGRST201`; la corregida llega a la comprobación de permisos y devuelve HTTP 401 con `42501`, sin leer filas. Esto valida la resolución de relaciones en el esquema desplegado, pero el resultado autenticado debe comprobarse tras publicar la corrección.

La prueba del repositorio reproduce ahora la respuesta `PGRST201` si falta cualquiera de las FK directas y comprueba que la consulta corregida conserva sus filtros y la interpretación de la respuesta. Se confirmó que esa prueba fallaba antes de cambiar la consulta.

### Comprobaciones generales

Las pruebas de `app/tests/database.test.mts` ejecutan la migración real en PostgreSQL embebido mediante PGlite. El entorno reproduce los roles `anon` y `authenticated`, dos usuarios ficticios y la lectura de `auth.uid()`; no utiliza cuentas reales ni sustituye Supabase Auth.

Se comprueban aislamiento en las tres tablas, denegación anónima y de escritura directa, protección frente a cambio de propietario, colisión de identificadores, reintentos idempotentes, versiones antiguas, correos duplicados, fechas inválidas, rechazo de campos privados y reversión completa ante excepciones inválidas. Las pruebas del repositorio usan el SDK Supabase con HTTP simulado y comprueban filtros por propietario, serialización sin deseos ni resultados y reintentos tras un fallo de respuesta.

Las 18 pruebas, TypeScript, lint y la exportación web forman parte de las comprobaciones de esta entrega. Las capturas de revisión usan sesiones y respuestas ficticias en `.local/auth-qa/`; no demuestran que la migración esté desplegada. El retorno de Google se comprueba también con ese entorno simulado para verificar que el cambio de almacén no pierde la navegación a la cuenta.

La consulta remota de solo lectura del agente ha confirmado HTTP 401 y `42501` en `draws`, `draw_participants` y `draw_exclusions`, utilizando la Publishable key sin sesión y `limit=0`. No se han inspeccionado datos ni todos los ajustes remotos. El usuario aún no ha confirmado el resultado del verificador SQL.

Pendiente tras desplegar: crear y editar un borrador desde la web, recuperarlo tras recargar y desde otro dispositivo, copiarlo, verificar mediante la API que otra cuenta no lo lee ni modifica, comprobar escrituras realmente concurrentes en dos sesiones y cerrar/cambiar de cuenta con una petición pendiente. PGlite valida las reglas SQL, pero no reproduce múltiples conexiones ni toda la infraestructura de Supabase/PostgREST.

La generación del sorteo, correos, invitados verificados, listas privadas, fotografías y compras siguen pendientes. Las pantallas de deseos de la cuenta explican su disponibilidad futura y no usan los datos de ejemplo como datos reales.

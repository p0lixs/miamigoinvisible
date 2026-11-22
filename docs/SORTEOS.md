# Generación en servidor y resultado propio

Esta entrega implementa el paso de borrador a sorteo realizado y la consulta del destinatario propio. Está preparada y probada localmente; todavía hay que aplicar la segunda migración y publicar el código. La primera migración de borradores ya fue ejecutada por el usuario y no debe repetirse.

El usuario ha confirmado euros, fecha de intercambio opcional y entre 3 y 100 participantes. El presupuesto es obligatorio y orientativo. Se permiten parejas recíprocas y no se exige que todo el grupo forme un único ciclo.

## Recorrido disponible

En la vista del organizador, «Preparar el sorteo» comprueba los datos del grupo. La confirmación explica que participantes, correos y excepciones quedarán bloqueados y que para repetir hay que crear una copia independiente. Solo después de pulsar «Confirmar y realizar sorteo» se llama al servidor.

Tras la confirmación del servidor se muestra «Sorteo realizado». La copia sigue disponible y comienza como un borrador nuevo, sin resultados ni accesos heredados. La edición del original queda bloqueada tanto en la interfaz como en la función de guardado.

Si el organizador participa con el correo de su cuenta, puede abrir «Ver mi resultado». La ruta `/resultado/[id]` muestra un sobre cerrado y solo solicita el destinatario al pulsar «Abrir mi sobre». No precarga el mapa de emparejamientos. El nombre revelado permanece únicamente en el estado de esa pantalla; se elimina al ocultarlo o desmontarla, incluyendo el cambio de cuenta o de sorteo.

El acceso disponible en la interfaz es Google. Un participante con una cuenta cuyo correo confirmado coincida con el añadido al grupo puede consultar su resultado en esa ruta aunque no sea organizador. No obtiene acceso a la lista de contactos ni al resto de resultados. Antes de abrir el enlace debe iniciar sesión; si llega sin sesión, la pantalla indica entrar y volver a abrir el enlace. Aún no hay listado de grupos en los que solo se participa ni retorno automático a este enlace después del login.

Los invitados sin cuenta y su verificación por correo siguen pendientes. Esta entrega no envía ni encola correos, invitaciones o enlaces; la confirmación lo indica explícitamente. La lista de deseos, sus fotografías y las compras siguen pendientes. Estos elementos permanecen en el alcance del primer lanzamiento público.

## Migración y funciones

Aplicar **solo** [202611220002_draw_runs.sql](../supabase/migrations/202611220002_draw_runs.sql), después de la migración de borradores. La migración es transaccional y se ejecuta una vez desde el SQL Editor del proyecto de desarrollo. Añade `drawn_at`, amplía el estado a `draft`/`drawn` y crea el esquema `draw_private`.

| Recurso | Propósito | Acceso de la app |
| --- | --- | --- |
| `draw_private.runs` | Una ejecución por sorteo, versión de entrada, petición y versión del algoritmo | Sin acceso directo |
| `draw_private.assignments` | Un destinatario por persona y una persona por destinatario | Sin acceso directo |
| `public.generate_draw` | Autorizar al organizador, comprobar versión, generar y confirmar | Solo sesiones autenticadas; devuelve metadatos |
| `public.get_my_draw_result` | Consultar exclusivamente el destinatario de la identidad verificada | Solo sesiones autenticadas; sin parámetro para elegir participante |
| `public.save_draw_draft` | Conservar el guardado y bloquear ediciones después de sortear | Solo el organizador, mientras sea borrador |

Las tablas privadas tienen RLS sin políticas para clientes y no conceden privilegios a `anon` ni `authenticated`; tampoco se concede uso del esquema. Las funciones públicas usan `SECURITY DEFINER`, `search_path` vacío y autorización explícita. La implementación anterior de guardado se mueve al esquema privado y deja de ser ejecutable directamente por los clientes; la función pública mantiene su firma y comprueba el bloqueo antes de delegar, incluidos reintentos de un guardado anterior.

El organizador se obtiene de `auth.uid()`. El parámetro de cuenta esperado solo evita mezclar sesiones en una petición pendiente y no permite suplantar otra cuenta. Para consultar el resultado se lee `auth.users.email` con `email_confirmed_at` establecido. No se usa el correo enviado por el cliente ni el nombre o los metadatos editables como prueba de identidad.

La consulta del resultado devuelve datos de presentación del grupo y el nombre del destinatario propio. No devuelve correos, IDs de otras personas, ejecuciones ni mapas. Para una cuenta no participante, un sorteo ajeno, inexistente o aún en borrador devuelve la misma disponibilidad negativa. Un organizador que no participa tampoco obtiene destinatarios.

## Algoritmo y transacción

La generación emplea emparejamiento bipartito con caminos aumentantes, aleatorizando el orden de personas y candidatos mediante `gen_random_uuid()` del servidor. No depende de asignaciones calculadas en el cliente ni acepta un mapa externo. Este procedimiento busca una solución completa respetando autoasignaciones y excepciones; no promete distribución uniforme entre todas las soluciones válidas.

La transacción bloquea la fila del sorteo, exige la versión de entrada y valida título, presupuesto y tamaño del grupo. Si no existe combinación, revierte todo y conserva el borrador sin resultados parciales. Las claves compuestas mantienen las asignaciones en el mismo grupo; las restricciones impiden autoasignaciones y destinatarios repetidos.

Solo se guarda una ejecución por entidad. Repetir una llamada, incluso con otro identificador de petición, conserva el resultado original y devuelve su estado. No se vuelve a sortear por un fallo de respuesta. El cliente recupera los metadatos actuales después de confirmar, para no atribuir una versión nueva a una vista antigua. La versión y el mismo bloqueo de fila impiden que una edición en curso cambie la configuración utilizada por la generación.

Al incorporar correos habrá que crear sus tareas persistentes en la transacción de confirmación y reutilizar esta ejecución para los reintentos; nunca generar de nuevo para resolver una entrega fallida.

## Comprobación y despliegue

1. En el SQL Editor de Supabase, ejecutar la migración `202611220002_draw_runs.sql` completa una sola vez.
2. Ejecutar [verify_draw_runs.sql](../supabase/checks/verify_draw_runs.sql): deben aparecer nueve comprobaciones con `correcto = true`. Es de solo lectura y no muestra resultados. El verificador de borradores continúa siendo válido tras esta migración.
3. Publicar el código en Vercel después de la migración. No requiere nuevas variables de entorno ni claves privilegiadas en la app.
4. Probar con participantes ficticios: presupuesto en EUR, cuenta organizadora que también participa, al menos tres personas y una excepción dirigida. Confirmar el sorteo y comprobar que ya no permite editar.
5. Abrir el sobre propio con el correo correcto y probar otra cuenta participante en el mismo enlace. Comprobar que una cuenta ajena no obtiene resultado, y que el organizador sin participación no accede a resultados ajenos.
6. Probar recarga, reintento de generación, copia, restricciones imposibles y edición/generación desde dos dispositivos. No afirmar que se ha enviado correo en esta fase.

Las pruebas automatizadas ejecutan ambas migraciones en PostgreSQL embebido. Cubren autorización del organizador, versión antigua, datos incompletos, unicidad, bloqueo de edición, reintentos, privacidad del resultado, correo sin confirmar, suplantación de cuenta, tablas privadas, parejas recíprocas, 100 personas y un caso imposible con opciones individuales pero sin combinación global. También contrastan grafos pequeños aleatorios con un buscador exhaustivo independiente.

Las pruebas del transporte cubren la confirmación seguida de fallo al recuperar metadatos, reutilización de la petición, lectura con el SDK y extracción de campos de presentación sin información adicional. Hay 29 pruebas en total. Las comprobaciones locales no sustituyen la ejecución real de PostgREST, la concurrencia entre conexiones ni la validación en Android e iOS. La segunda migración no se ha aplicado al proyecto remoto desde el agente.

Se han inspeccionado capturas de Taste Skill del borrador listo para preparar y del estado realizado a 1440 píxeles y del sobre cerrado a 390 píxeles, con una sesión y respuestas locales ficticias. No se ha realizado un sorteo real ni leído resultados del proyecto remoto para esas capturas. La interacción completa de confirmación, revelado y cambio de cuenta debe probarse tras aplicar y desplegar.

# Datos y seguridad

## Modelo conceptual propuesto

Este modelo define responsabilidades y restricciones. Todavía no es una migración SQL.

| Entidad | Datos principales | Restricciones |
| --- | --- | --- |
| `profiles` | Usuario de Auth, nombre visible | Un perfil por cuenta; sin copiar tokens sociales |
| `draws` | Organizador, título, descripción, presupuesto orientativo en unidad mínima, moneda, fecha opcional, estado y versión | Propietario obligatorio; presupuesto obligatorio para sortear; cambios sensibles solo en borrador |
| `participants` | Sorteo, nombre, correo original y normalizado | Correo único dentro del sorteo; identificadores propios, no derivados del correo |
| `participant_access` | Participante, cuenta vinculada o sesión limitada, verificación y caducidad | Vinculación únicamente tras demostrar acceso al correo de esa persona |
| `exclusions` | Sorteo, quien regala y destinatario prohibido | Única por pareja dirigida; ambos participantes del mismo sorteo |
| `draw_runs` | Sorteo, versión de entrada, versión del algoritmo, fecha, clave idempotente | Una ejecución por sorteo en el MVP |
| `assignments` | Ejecución, participante que regala y destinatario | Quien regala único y destinatario único por ejecución; prohibida autoasignación |
| `wishlist_items` | Participante, texto, enlace opcional, orden y fechas | Pertenencia al grupo; edición del autor antes y después del sorteo |
| `wishlist_photos` | Elemento de deseo, ruta privada de Storage y metadatos mínimos | Autorización tanto en metadatos como en Storage; límites de tamaño y cantidad por definir |
| `access_tokens` | Hash de token, participante, finalidad, expiración y revocación | Nunca almacenar el token en claro; acceso a un solo participante |
| `email_outbox` | Sorteo, ejecución opcional, participante, tipo, estado, intentos, próxima ejecución y arrendamiento | Invitaciones previas sin ejecución; resultado inicial único por ejecución y participante; deduplicación separada por tipo de mensaje |
| `email_events` | ID externo, tipo, fecha y referencia al envío | Evento externo único; sin conservar cuerpos de correo por defecto |
| `audit_events` | Actor, acción, entidad y fecha | Sin destinatarios secretos ni enlaces de acceso |
| `entitlements` | Cuenta del organizador, producto de listas de deseos, origen y referencia del proveedor | Compra permanente; escritura exclusiva del servidor y estado de revocación o reembolso |

En SQL, usar claves foráneas compuestas para garantizar que exclusiones y asignaciones pertenecen al mismo grupo o ejecución. Las restricciones entre filas, como no violar una exclusión, se validan también en la transacción de confirmación. Los importes no usan coma flotante.

## Matriz de permisos

| Recurso | Organizador propietario | Participante verificado | Persona sin verificar |
| --- | --- | --- | --- |
| Metadatos del grupo | Lectura y edición según estado | Lectura limitada de su grupo | Sin acceso privado |
| Nombres y correos | Gestión mientras es borrador; lectura posterior | Solo lo necesario de sí mismo y nombre de su destinatario | Sin acceso |
| Excepciones | Gestión antes del sorteo | Sin acceso por defecto | Sin acceso |
| Asignaciones | Solo la propia si participa | Solo su destinatario | Sin acceso |
| Deseos y fotografías | Lista propia y la de su destinatario si participa; sin privilegio general | Lista propia y, tras el sorteo, la de su destinatario | Sin acceso |
| Estados de correo | Consulta del grupo y reenvío autorizado | Estado propio si se muestra | Sin acceso |
| Tokens y claves | Sin acceso a secretos de otros | Uso de su credencial, sin listar tokens | Sin acceso |

Propuesta de implementación: no exponer `assignments`, tokens ni bandeja de correo mediante consultas generales. Devolver el resultado propio mediante un endpoint limitado que derive el participante de una sesión verificada. Evitar joins, vistas o políticas que permitan al propietario leer resultados ajenos.

Las tablas expuestas requieren [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), pruebas de aislamiento y permisos explícitos. Las funciones privilegiadas necesitan autorización adicional; si se usan funciones `SECURITY DEFINER`, fijar `search_path`, restringir `EXECUTE` y evitar SQL dinámico inseguro.

## Acceso por código y correo

Propuesta: código de grupo de 10 caracteres de un alfabeto sin símbolos ambiguos, generado con aleatoriedad criptográfica, con rotación y límites de intentos. Sirve para localizar el flujo de acceso; no revela participantes ni resultados. Guardar su verificador mediante HMAC con secreto del servidor, dado que un código corto tiene entropía limitada.

La combinación de código y correo produce siempre una respuesta genérica. Solo si el correo corresponde al grupo se envía la verificación. Limitar solicitudes por IP, grupo y correo, con cuotas y medidas adicionales ante abuso.

El enlace individual lleva un token aleatorio de al menos 256 bits y una finalidad específica. Guardar su hash, caducidad y revocación. Canjearlo por una sesión restringida mediante una acción explícita: abrir un GET desde un escáner de correo no debe consumir el acceso ni marcar el resultado como leído. Retirar la credencial de la URL tras el canje y no cargar analítica de terceros en esa pantalla. Usar respuestas privadas sin caché y política de referencia restrictiva.

El organizador no puede reclamar la identidad de un invitado simplemente editando su dirección tras el sorteo. Corregir un correo después de sortear requiere un flujo de recuperación verificable que aún debe diseñarse; hasta entonces, bloquear esa edición.

## Cuentas sociales y participantes

Una cuenta que inicia sesión no se vincula a un participante por compartir un nombre. Exigir verificación del correo invitado o el enlace privado correspondiente. Considerar especialmente «Ocultar mi correo» de Apple: el correo relay puede no coincidir con el que escribió el organizador.

Los invitados pueden tener sesiones técnicas limitadas sin un alta de organizador. El proveedor y almacenamiento de esas sesiones quedan para la prueba técnica. Si se representan mediante Supabase Auth, incluir sus registros en el ciclo de borrado y no crear cuentas permanentes automáticamente al introducir un código.

## Listas de deseos y fotografías

Los participantes verifican su acceso antes de editar deseos o subir imágenes, también antes de que el sorteo esté realizado. La compra permanente pertenece al organizador; no concede permiso para suplantar a los autores ni revelar asignaciones.

Si se cambia el correo de un participante en borrador después de invitarlo, revocar sus accesos anteriores y exigir nueva verificación. No trasladar automáticamente los deseos o fotografías ya aportados a una identidad diferente; concretar este caso en el flujo de corrección.

Regla confirmada: el autor puede consultar su lista y, tras el sorteo, quien debe regalarle también. Nadie más del grupo puede leerla. No dar al autor acceso a la identidad de esa persona mediante logs, metadatos o estados de lectura. La matriz anterior no concede acceso general a deseos ajenos por ser organizador. Aplicar la misma regla a textos, enlaces, metadatos y archivos de fotografías.

Usar un bucket privado para fotos, con autorización por objeto y enlaces temporales solo tras comprobar el acceso. Validar formato real, tamaño y dimensiones; generar nombres de archivo propios y retirar metadatos de ubicación cuando sea posible. No aceptar HTML o SVG como fotografías. Los límites y tratamiento de contenido denunciado se concretarán antes de activar subidas públicas.

Tratar los enlaces como datos: admitir protocolos seguros y no descargar automáticamente URLs arbitrarias para obtener vistas previas. Si se añaden vistas previas más adelante, diseñar protección frente a peticiones del servidor a destinos internos.

Al copiar un sorteo, crear participantes nuevos y no heredar tokens, sesiones, asignaciones ni fotografías. La eventual copia de deseos requiere una decisión explícita. Al borrar deseos o participantes, contemplar tanto las filas como los objetos de Storage.

## Límites de privacidad

La aplicación impide consultar emparejamientos ajenos mediante sus interfaces y API. Los administradores de infraestructura y el servicio de correo procesan los datos necesarios; esta propuesta no proporciona cifrado de extremo a extremo.

En grupos pequeños o con restricciones muy fuertes, una persona puede deducir otros emparejamientos. Incluso puede existir una única solución. No prometer que las relaciones son imposibles de inferir. Revisar cómo explicar al organizador los casos demasiado determinados sin revelar una asignación concreta.

## Datos personales y operaciones

- Recoger nombre, correo y datos del sorteo, además de los textos, enlaces y fotografías que se aporten voluntariamente a las listas de deseos. No pedir acceso completo a contactos o fototecas.
- Usar participantes ficticios con dominios `.example` en pruebas y capturas.
- Renderizar título, descripción y nombres como texto; escapar su contenido en plantillas de correo.
- Mantener secretos de Supabase, SMTP y pagos en servicios de servidor, fuera del bundle web o móvil.
- Aplicar cuotas de sorteos, verificaciones y reenvíos; detectar rebotes y quejas para prevenir abuso.
- Definir retención, región de datos, política de privacidad y borrado antes de producción, incluidos terceros y copias de seguridad.
- Concretar qué ocurre con un grupo activo si su organizador borra la cuenta. Propuesta inicial: cancelar y purgar los grupos propios tras informar del efecto, conservando solo lo que corresponda a una política de retención definida.
- Permitir que un invitado solicite borrar sus datos verificando su correo. Explicar el efecto sobre un sorteo ya realizado; no reasignar personas silenciosamente.

Estas decisiones operativas están pendientes de concretarse; no sustituyen una política de privacidad publicada.

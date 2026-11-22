# Prototipo de Mi amigo invisible

## Alcance disponible

La aplicación se encuentra en `app/`, con Expo SDK 58, React Native, Expo Router y TypeScript. Sin sesión se utiliza la demo ficticia de Ana y dos grupos de ejemplo. El usuario confirma la [migración de borradores](BORRADORES.md) en Supabase y el guardado de un borrador en la web tras corregir `PGRST201`. Las demás pruebas remotas siguen pendientes. Los nombres y correos de la demo no pertenecen a participantes reales.

| Recorrido | Comportamiento implementado |
| --- | --- |
| Mis sorteos | Listado y filtros entre todos, borradores y sorteados |
| Crear y editar | Asistente con datos, participantes, excepciones dirigidas o mutuas y revisión |
| Presupuesto | Obligatorio antes de completar el asistente; admite euros y céntimos, sin coma flotante para los importes |
| Guardar y salir | Conserva un borrador incompleto: local en la demo y en Supabase para la cuenta, esperando la confirmación del servidor |
| Copiar sorteo | Crea identificadores nuevos y remapea las excepciones, sin heredar resultados o deseos |
| Generación en cuenta | Confirmación explícita y llamada al servidor; requiere la segunda migración y desplegar esta entrega |
| Resultado propio | La demo revela una escena fija; la cuenta consulta solo su destinatario mediante Auth, al pulsar abrir el sobre |
| Mis deseos | Añadir, editar y eliminar texto y enlaces; seleccionar fotos para la sesión |
| Deseos del destinatario | Consulta de la lista ficticia de la persona asignada a Ana |
| Inicio de sesión | Google mediante Supabase y PKCE; acceso correcto en la web desplegada confirmado por el usuario. Recarga, cierre y errores con el proveedor real pendientes de confirmar |
| Código de invitación | Pantalla de ejemplo; falta conectar la verificación real |
| Compra permanente | Explicación del extra y restauración pendiente, sin precio inventado ni cobros simulados |

La interfaz utiliza regalos ilustrados en SVG, títulos Fredoka, texto Nunito Sans, fondos claros y acentos azul, coral, amarillo y menta. Las fuentes se empaquetan con la app y las ilustraciones están construidas como componentes compatibles con las tres plataformas.

## Ejecución local

Desde la raíz del proyecto, en PowerShell:

```powershell
cd app
npm.cmd install
npm.cmd run web
```

Abrir la dirección local que imprima Expo. Los wrappers `.cmd` evitan el bloqueo de scripts `.ps1` observado en este equipo, sin modificar la política de ejecución de PowerShell.

Para preparar la web exportada: `npm.cmd run build:web`. La salida está en `app/dist/`. Vercel utiliza `app/` como directorio raíz y la configuración incluida en `app/vercel.json`. El usuario confirma el despliegue y un acceso correcto con Google en `https://miamigoinvisible.vercel.app`. Consultar la [configuración de servicios](CONFIGURACION-SERVICIOS.md).

## Datos y límites del prototipo

Los borradores y deseos de texto de la demo se conservan mediante AsyncStorage en este dispositivo o navegador. Las fotografías de la demo permanecen en memoria durante la sesión; no se suben ni se sincronizan. Para explorar se han fijado límites provisionales de 3 fotos por deseo y 5 MB por foto, con JPG, PNG y WebP. Los borradores de la cuenta usan exclusivamente el repositorio de Supabase; ante un fallo no se sustituyen por ejemplos ni se guardan en el almacén local.

La sesión de Supabase se conserva mediante su SDK, separada del almacén de la demo. Entrar con Google no convierte los borradores de Ana en sorteos de la cuenta. El usuario confirma un inicio de sesión correcto en la web; la recarga y el cierre con el proveedor real, Apple y el acceso verificado por código siguen pendientes de verificar.

El ejemplo contiene los datos necesarios para mostrar las pantallas; no implementa aislamiento de datos de producción. No utilizarlo con datos personales reales. La privacidad efectiva deberá verificarse en el servidor y en Supabase Storage al conectar los servicios.

La generación de emparejamientos queda reservada al backend. La nueva entrega incluye «Preparar el sorteo» y una confirmación que bloquea la configuración al completarse. No anuncia correos enviados: todavía no se envían ni se encolan. Requiere aplicar la segunda migración y publicar el código; consultar [Generación y resultado propio](SORTEOS.md).

EUR, fecha opcional y entre 3 y 100 participantes están confirmados para la primera versión. Listas vacías al copiar y los límites de fotografías siguen siendo provisionales. El precio continúa pendiente.

## Verificación

La verificación de esta entrega comprende TypeScript, lint, 29 pruebas y exportación web. Las pruebas incluyen dominio, autenticación y repositorios con el SDK y HTTP simulado, las dos migraciones en PostgreSQL embebido, generación y consulta del destinatario propio con identidades ficticias. La validación SQL local no sustituye las pruebas remotas de Supabase/PostgREST ni de múltiples conexiones concurrentes. La base anterior también se exportó para Android e iOS; no equivale a validar los nuevos flujos en dispositivos.

Se ha revisado el acceso exportado mediante capturas de Taste Skill a 390 y 1440 píxeles, y el retorno de cancelación a 390 píxeles, con un servidor local que reproduce el retorno a la SPA. Las capturas se conservan en `.local/auth-qa/`, fuera de Git. El servidor `expo serve` no aplicó ese retorno para `/acceso`, por lo que no se utilizó para aprobar las rutas. El usuario confirma un inicio de sesión correcto con Google en la web desplegada. La revisión del resto de pantallas, las pruebas restantes de sesión y la interfaz en dispositivos Android o iOS siguen pendientes. No se han generado binarios firmados.

Se ha aplicado un override de `minimatch` a 11.0.1 únicamente bajo `@expo/fingerprint` para resolver el [aviso GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) de la cadena de compilación. La instalación posterior informa de cero vulnerabilidades. Revisar y retirar el override cuando Expo incorpore la corrección.

## Siguiente integración

Aplicar la segunda migración y publicar la generación y el resultado propio. Completar las pruebas remotas de recuperación tras recarga, copia, aislamiento y concurrencia, además de cierre y errores de sesión. Después, conectar acceso de invitados y correo persistente; subir fotos a Storage privado; integrar compra permanente y restauración. Las listas y los pagos forman parte del alcance del primer lanzamiento, aunque esta entrega aún no los conecta.

El usuario ha proporcionado las URL de Supabase y Vercel y la Publishable key. La configuración local está preparada, la web responde y el endpoint público de Supabase Auth confirma Google habilitado tras la configuración realizada por el usuario. Las integraciones de gestión no están conectadas en esta sesión; el agente no ha aplicado migraciones ni modificado los ajustes remotos.

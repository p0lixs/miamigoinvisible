# Conexión con Supabase y Vercel

El usuario confirma, el 22 de noviembre de 2026, que la web se ha desplegado en Vercel y ha podido iniciar sesión con Google mediante Supabase. Quedan por confirmar la permanencia de la sesión al recargar, su cierre y los casos de error con el proveedor real. La migración de [borradores privados de cuenta](BORRADORES.md) ya está ejecutada según confirma el usuario; falta publicar el código de esta entrega. Iniciar sesión no importa los datos de la demo.

## Servicios confirmados

| Servicio | Dirección |
| --- | --- |
| Web estable en Vercel | `https://miamigoinvisible.vercel.app` |
| Proyecto Supabase de desarrollo | `https://osuagtuwrgohzrnmrgel.supabase.co` |
| Panel Supabase | `https://supabase.com/dashboard/project/osuagtuwrgohzrnmrgel` |

Comprobación del 22 de noviembre de 2026: la web responde HTTP 200 en `/` y `/acceso`. El endpoint público de ajustes de Auth acepta la Publishable key y, tras la configuración realizada por el usuario, devuelve Google habilitado. El usuario confirma también la configuración del cliente OAuth y de las URL de retorno. Estas consultas no validan las tablas, RLS, la región elegida ni el flujo OAuth completo. El agente no ha modificado los proyectos remotos.

La clave pública proporcionada está guardada en `app/.env.local`, ignorado por Git, y la aplicación desplegada dispone de la configuración necesaria para el acceso confirmado por el usuario. No se reproduce en esta documentación; no se han inspeccionado los ajustes privados de Vercel. El dominio de Vercel sirve para esta fase sin contratar un dominio propio.

## Variables de la aplicación

| Variable | Valor |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL` | `https://osuagtuwrgohzrnmrgel.supabase.co` |
| `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | La Publishable key del proyecto, con prefijo `sb_publishable_` |

En local, crear `app/.env.local` siguiendo `app/.env.example` y reiniciar Expo al cambiarlo. Ya está preparado en este equipo. La aplicación funciona como demo sin estas variables y deshabilita Google cuando faltan o no son válidas.

En Vercel, abrir el proyecto → **Settings → Environment Variables**, añadir ambas variables al entorno **Production** y guardar. El uso de Production en Vercel identifica la URL estable; el backend sigue siendo el proyecto Supabase de desarrollo. Los datos de pruebas deben seguir siendo ficticios. La configuración de Preview se decidirá aparte, con sus retornos autorizados y sin habilitar todos los dominios de Vercel.

Publicar los cambios de código en GitHub y generar un despliegue nuevo después de guardar las variables. Expo incorpora los valores `EXPO_PUBLIC_*` al compilar: cambiar solo la configuración de Vercel no modifica un bundle ya publicado. Mantener `app` como Root Directory; `app/vercel.json` define `npm run build:web`, salida `dist` y retorno a la SPA para las rutas.

Nunca introducir contraseñas de base de datos, claves `sb_secret_*`, `service_role` ni el secreto de Google en variables `EXPO_PUBLIC_*`. La Publishable key identifica la aplicación; los permisos efectivos deben aplicarse en el servidor y en la base de datos.

## Configurar Google

1. Abrir [Google Auth Platform](https://console.cloud.google.com/auth/overview), seleccionar o crear el proyecto de Google Cloud y configurar la pantalla de consentimiento con el nombre «Mi amigo invisible», el correo de soporte y el contacto del desarrollador.
2. Si la audiencia está en modo de pruebas, añadir como usuarios de prueba las cuentas que se utilizarán para verificar el acceso.
3. En **Clients**, crear un cliente OAuth de tipo **Web application**. Como origen JavaScript autorizado, añadir `https://miamigoinvisible.vercel.app`. Para pruebas locales en el puerto habitual de Expo, añadir `http://localhost:8081` si ese es el puerto efectivo.
4. Como URI de redirección autorizada de Google, añadir exactamente:

   ```text
   https://osuagtuwrgohzrnmrgel.supabase.co/auth/v1/callback
   ```

5. En Supabase → **Authentication → Sign In / Providers → Google**, activar Google, guardar el **Client ID** y **Client Secret** del cliente web y mantener la validación de nonce predeterminada. Verificar que la URL de callback mostrada por Supabase coincide con la anterior. Guardar el secreto directamente en ese panel, fuera del repositorio y del chat.

El callback de Google termina en Supabase. Después Supabase devuelve al usuario a la app mediante las URL del siguiente apartado. Seguir la [guía oficial de Google y Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).

## Configurar el retorno a la aplicación

En Supabase → **Authentication → URL Configuration**:

| Campo | Valor |
| --- | --- |
| Site URL | `https://miamigoinvisible.vercel.app` |
| Redirect URLs | `https://miamigoinvisible.vercel.app/auth/callback` |
| Retorno local, si Expo usa 8081 | `http://localhost:8081/auth/callback` |

El código utiliza el origen actual del navegador y la ruta `/auth/callback`; si Expo cambia de puerto, autorizar exactamente el nuevo retorno. No usar comodines amplios en el despliegue estable. Ver la [guía de redirecciones de Supabase](https://supabase.com/docs/guides/auth/redirect-urls).

Para Android e iOS se ha preparado el retorno con `Linking.createURL` y el esquema `miamigoinvisible`, y se utiliza el navegador del sistema. Antes de habilitarlo para distribución hay que verificar la URI exacta en una compilación de desarrollo, autorizarla en Supabase y probar apertura, cancelación, arranque en frío y sesión. Expo Go no sustituye esa prueba.

## Comportamiento implementado

- Cliente Supabase con flujo PKCE. El SDK conserva y renueva la sesión; en móvil utiliza AsyncStorage y ajusta la renovación al estado de la app.
- Consulta pública de disponibilidad de Google antes de salir de la app; si falta el proveedor, el usuario recibe un mensaje y puede seguir explorando.
- Retorno validado por origen y ruta; canje del código de un solo uso, limpieza de parámetros del historial y tratamiento de cancelación o error sin mostrar respuestas externas.
- Evita canjear dos veces el mismo código por montajes de React o retornos nativos duplicados. Admite el identificador `sb_flow_id` cuando Supabase lo incluye.
- Pantalla de cuenta con la identidad autenticada y cierre de sesión en el dispositivo actual.
- Los datos de Ana, resultados y deseos de ejemplo no se migran ni se atribuyen a la persona autenticada. Los nuevos borradores de cuenta tienen tablas y permisos propios en la migración que el usuario confirma haber ejecutado.

## Validación

Ejecutar `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd test` y `npm.cmd run build:web` desde `app/`.

Las pruebas automatizadas cubren configuración pública, validación y errores del retorno, rechazo de retornos de otros orígenes y de tokens implícitos, canje PKCE único, persistencia y cierre de sesión con el SDK real y respuestas HTTP simuladas. No crean usuarios ni sustituyen una prueba real con Google.

TypeScript, lint, las 18 pruebas y la exportación web forman parte de la verificación de esta entrega. Se han inspeccionado capturas locales de acceso a 390 y 1440 píxeles, del retorno de cancelación y de los nuevos flujos con sesiones y respuestas ficticias. El usuario confirma un acceso real con Google en la web desplegada; el agente no ha inspeccionado su sesión ni sus datos personales.

El inicio de sesión ya está confirmado por el usuario. Para completar la validación: comprobar la identidad en `/cuenta`, recargar, abrir otra pestaña del mismo origen y cerrar sesión. Probar también cancelar en Google, denegar el acceso y volver a un enlace caducado. Tras publicar la nueva entrega, la cuenta debe mostrar solo sus borradores; los ejemplos continúan en la demo sin sesión.

El usuario confirma que ha ejecutado la migración mediante el panel. El siguiente hito es publicar esta entrega y verificar mediante la API real que dos cuentas distintas no acceden a los datos de la otra. La consulta sin sesión a las tres tablas ya devuelve acceso denegado. Hay un verificador SQL de solo lectura para revisar el catálogo y los permisos desde el panel, sin necesitar la integración de gestión. Consultar [Borradores privados](BORRADORES.md).

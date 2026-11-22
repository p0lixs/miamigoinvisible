# Conexión con Supabase y Vercel

La aplicación tiene preparado el acceso con Google mediante Supabase. El usuario confirma que ha configurado Google OAuth y los retornos; falta añadir las variables de Vercel, publicar el código y validar el acceso real. Los sorteos y deseos siguen siendo una demo local; iniciar sesión no los sube ni los vincula a la cuenta.

## Servicios confirmados

| Servicio | Dirección |
| --- | --- |
| Web estable en Vercel | `https://miamigoinvisible.vercel.app` |
| Proyecto Supabase de desarrollo | `https://osuagtuwrgohzrnmrgel.supabase.co` |
| Panel Supabase | `https://supabase.com/dashboard/project/osuagtuwrgohzrnmrgel` |

Comprobación del 22 de noviembre de 2026: la web responde HTTP 200 en `/` y `/acceso`. El endpoint público de ajustes de Auth acepta la Publishable key y, tras la configuración realizada por el usuario, devuelve Google habilitado. El usuario confirma también la configuración del cliente OAuth y de las URL de retorno. Estas consultas no validan las tablas, RLS, la región elegida ni el flujo OAuth completo. El agente no ha modificado los proyectos remotos.

La clave pública proporcionada está guardada solo en `app/.env.local`, ignorado por Git. No se reproduce en esta documentación. El dominio de Vercel sirve para esta fase sin contratar un dominio propio.

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
- Los datos de Ana, borradores, resultados y deseos de ejemplo no se migran ni se atribuyen a la persona autenticada. No hay tablas ni permisos de sorteos implementados en esta tarea.

## Validación

Ejecutar `npm.cmd run typecheck`, `npm.cmd run lint`, `npm.cmd test` y `npm.cmd run build:web` desde `app/`.

Las pruebas automatizadas cubren configuración pública, validación y errores del retorno, rechazo de retornos de otros orígenes y de tokens implícitos, canje PKCE único, persistencia y cierre de sesión con el SDK real y respuestas HTTP simuladas. No crean usuarios ni sustituyen una prueba real con Google.

TypeScript, lint, las ocho pruebas y la exportación web han terminado correctamente. Se han inspeccionado capturas locales de acceso a 390 y 1440 píxeles y del retorno de cancelación a 390 píxeles. La cuenta autenticada y las interacciones con el proveedor real siguen pendientes de verificar.

Después de configurar OAuth y publicar: entrar con una cuenta de pruebas, comprobar su identidad en `/cuenta`, recargar, abrir otra pestaña del mismo origen y cerrar sesión. Probar también cancelar en Google, denegar el acceso y volver a un enlace caducado. Los sorteos deben seguir apareciendo como demo y no como datos de la cuenta.

El siguiente hito es crear migraciones y permisos para guardar borradores por organizador, y verificar mediante la API que dos cuentas distintas no acceden a los datos de la otra.

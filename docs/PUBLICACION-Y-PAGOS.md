# Publicación y pagos

## Distribución propuesta

| Destino | Proceso |
| --- | --- |
| Web | Exportación de Expo y despliegue en Vercel |
| Android | Binario firmado, pruebas en Google Play y revisión |
| iOS | Binario firmado, TestFlight y revisión en App Store |
| Datos y funciones | Proyecto Supabase con migraciones y secretos por entorno |
| Correos | Dominio remitente verificado y proveedor transaccional |

El usuario ha creado los proyectos Supabase y Vercel y ha proporcionado sus URL y la clave pública. El 22 de noviembre de 2026 confirma el despliegue web y un inicio de sesión correcto con Google. Permanencia de la sesión al recargar, cierre y errores con el proveedor real siguen pendientes de confirmar. El proyecto Supabase se solicitó para desarrollo. Región y reglas de datos siguen pendientes de verificar. Faltan las cuentas de desarrollador de Apple y Google y el dominio propio.

## Siguiente hito de integración

El usuario confirma el despliegue, el acceso con Google, la migración y el guardado web de un [borrador privado](BORRADORES.md) tras corregir `PGRST201`. La API reconoce las tablas y rechaza consultas anónimas. Recuperación tras recarga, edición, copia, aislamiento y concurrencia remota, además de las pruebas de sesión restantes, siguen pendientes. La siguiente lista conserva el procedimiento de preparación y validación, no una lista íntegra de tareas pendientes.

1. Mantener `app/` como raíz y `dist/` como salida. La versión anterior responde en la URL estable y en `/acceso`; verificar también `/auth/callback` tras publicar los cambios.
2. Añadir `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` al entorno de Vercel correspondiente. La configuración local ya está preparada y el código lee estas variables. Nunca usar una clave secreta, `service_role` o contraseña de base de datos en ellas.
3. Configurar Google OAuth: crear las credenciales en Google Auth Platform, registrar allí la URL de callback que muestra Supabase y guardar el Client ID y Client Secret en el proveedor Google de Supabase. El secreto pertenece a la configuración del proveedor, no al bundle de Expo. Seguir la [guía de Google de Supabase](https://supabase.com/docs/guides/auth/social-sign-in/auth-google).
4. Configurar Site URL y las URL de retorno autorizadas en Supabase, incluida `https://miamigoinvisible.vercel.app/auth/callback`. Distinguir este retorno a la app del callback de Google a Supabase. Usar rutas exactas para el despliegue estable, según la [guía de redirecciones](https://supabase.com/docs/guides/auth/redirect-urls).
5. Publicar el código preparado y probar acceso correcto, cancelación, error, recarga y cierre con Google real. La verificación web no sustituye la prueba de enlaces y sesiones en Android e iOS.
6. Aplicar la migración y desplegar los borradores por organizador ya implementados. Comprobar con dos cuentas que ninguna puede acceder a los datos de la otra mediante la API real. Mantener los datos ficticios separados de las cuentas reales.

La siguiente entrega de [generación y resultado propio](SORTEOS.md) ya está preparada en el código local. Aplicar solo la segunda migración, comprobar sus permisos y desplegar para validar generación, bloqueo de edición y consulta propia con correo confirmado de Auth. Después conectar acceso verificado de invitados sin cuenta y correos. Las listas de deseos y la compra permanente siguen siendo obligatorias para el primer lanzamiento público.

## Preparación para las tiendas

Apple exige una alternativa equivalente que cumpla las condiciones de privacidad de su regla 4.8 al usar un login social como Google. Se propone Sign in with Apple. También exige ofrecer eliminación de cuenta dentro de la app cuando existe creación de cuentas. Véanse las [reglas de revisión de Apple](https://developer.apple.com/app-store/review/guidelines/).

Google Play exige un recorrido de borrado dentro de la app y un recurso web para solicitarlo cuando la app permite crear cuentas. Véanse sus [requisitos de eliminación](https://support.google.com/googleplay/android-developer/answer/13327111).

Para determinadas cuentas personales nuevas, Google exige una prueba cerrada con al menos 12 participantes durante 14 días continuados antes de solicitar acceso a producción. Comprobar su aplicación al crear la cuenta, según los [requisitos de pruebas](https://support.google.com/googleplay/android-developer/answer/14151465).

Preparar además icono, capturas reales, descripción, clasificación de edad, contacto de soporte, política de privacidad, declaraciones de datos de cada tienda y un recorrido de revisión con datos ficticios. Revisar los requisitos de SDK y sistema operativo en el momento de enviar la app.

## Modelo de negocio confirmado

La aplicación será gratuita; el sorteo básico y las excepciones permanecen gratis. El extra confirmado es la lista de deseos con texto, enlaces y fotografías. El organizador la desbloquea mediante una compra permanente para su cuenta, de modo que los participantes puedan usarla en sus grupos sin pagar individualmente.

La compra es permanente para la cuenta del organizador y estará disponible junto con las listas desde la primera versión pública. Queda pendiente el precio. Propuesta: permitir activarla también en grupos existentes; concretar qué ocurre con el contenido si se reembolsa la compra.

## Integración de pagos propuesta

Como base, usar compras integradas para desbloquear funciones digitales en las apps, respetando las excepciones regionales y programas aplicables al lanzamiento. Consultar las reglas de [Apple sobre compras](https://developer.apple.com/app-store/review/guidelines/#in-app-purchase) y la [política de pagos de Google Play](https://support.google.com/googleplay/android-developer/answer/9858738).

Se propone evaluar [RevenueCat para Expo](https://www.revenuecat.com/docs/getting-started/installation/expo). La decisión sobre cobro web será posterior, con identidad de compra común y reconciliación en el servidor.

Los permisos de pago se validan en servidor, con restauración de la compra permanente, gestión de reembolsos y webhooks idempotentes. El cliente no puede marcarse como premium. Vincular el derecho a la cuenta del organizador y resolver restauraciones y cambios de dispositivo sin duplicar el cobro. Los invitados no pagan por consultar su resultado o usar las listas habilitadas por el organizador.

## Infraestructura y presupuesto

Separar desarrollo y producción, con datos ficticios fuera de producción. Configurar OAuth y enlaces autorizados por entorno. El dominio deberá servir también soporte, privacidad, solicitud de borrado y asociación de enlaces móviles.

Los correos necesitan verificación del remitente y configuración SPF, DKIM y DMARC según el proveedor. Medir entregas, rebotes y quejas antes del lanzamiento.

Presupuestar cuentas de desarrollador, base de datos, funciones, correo, hosting web, dominio, compilaciones y eventual servicio de pagos. Los planes gratuitos pueden servir para pruebas; la selección final depende de volumen, uso comercial y condiciones vigentes. No se han elegido planes ni contratado servicios.

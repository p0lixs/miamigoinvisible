# Publicación y pagos

## Distribución propuesta

| Destino | Proceso |
| --- | --- |
| Web | Exportación de Expo y despliegue en Vercel |
| Android | Binario firmado, pruebas en Google Play y revisión |
| iOS | Binario firmado, TestFlight y revisión en App Store |
| Datos y funciones | Proyecto Supabase con migraciones y secretos por entorno |
| Correos | Dominio remitente verificado y proveedor transaccional |

El usuario ya tiene cuentas de Supabase y Vercel y ha confirmado que aún no existe un proyecto Supabase para esta app. El siguiente paso es crear uno de desarrollo. Faltan las cuentas de desarrollador de Apple y Google y el dominio.

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

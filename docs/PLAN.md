# Plan de desarrollo

## Fase 1 Definición

Completar las decisiones de producto e identidad. Están confirmados el presupuesto obligatorio y orientativo en EUR, fecha opcional, entre 3 y 100 participantes, las parejas recíprocas, el estilo para todo el año, la copia como entidad nueva y las listas de deseos mediante compra permanente del organizador desde el primer lanzamiento. Cada lista es privada para su autor y quien deba regalarle. Concretar recuperación de correo, copia de deseos y precio. Resultado: requisitos actualizados y recorrido de pantallas.

## Fase 2 Diseño y prueba técnica

Preparar un prototipo de bienvenida, creación, excepciones y resultado con la dirección colorida para todo el año; incluir copia de sorteos y pantallas de deseos y fotos. Validar Expo en Android, iOS y web, Google, Apple, sesiones de invitado y enlaces profundos. Verificar que una web exportada funciona en Vercel con rutas abiertas directamente.

Resultado: una dirección visual revisable y evidencia de que autenticación y distribución son compatibles. La evaluación de iOS requerirá credenciales y acceso a dispositivos o servicios adecuados cuando corresponda.

## Fase 3 Dominio y base de datos

Crear migraciones, permisos, validación y algoritmo. Implementar confirmación transaccional, bloqueo por versión e idempotencia.

Validar propiedades: cada persona da y recibe una vez, sin autoasignaciones ni exclusiones; casos imposibles detectados; rechazo de datos de grupos distintos; doble envío concurrente y cambios durante la generación. Probar privacidad entre dos organizadores y entre participantes mediante la API.

## Fase 4 Acceso y correos

Implementar invitados sin registro obligatorio, códigos, verificación de identidad, enlace individual, invitaciones previas para rellenar deseos, bandeja de tareas, worker y webhooks. Usar primero un entorno de correo de pruebas.

Validar caídas antes y después de guardar el sorteo, aceptación de correo con respuesta perdida, tareas repetidas, expiración de accesos, escáneres de enlaces y límites de reenvío. Nunca volver a sortear para resolver un fallo de entrega.

## Fase 5 Núcleo gratuito

Integrar creación, borradores, excepciones, gestión de envíos y consulta privada. Completar estados vacíos, carga y errores. Revisar accesibilidad, teclado, nombres largos, conectividad intermitente y comportamiento en dispositivos reales.

Resultado: recorrido completo del núcleo gratuito con usuarios de prueba desde la creación hasta la recepción del resultado. La primera publicación requiere completar también las listas y las compras de la fase siguiente.

## Fase 6 Listas de deseos y compra permanente

Incorporar las listas de deseos y su compra permanente antes del primer lanzamiento público. Implementar texto, enlaces, fotografías privadas y edición antes y después del sorteo, junto con restauración, validación, reembolso y derechos compartidos entre plataformas. Probar en los entornos de compra de las tiendas y verificar el aislamiento de imágenes y listas entre grupos, la copia sin accesos heredados y que editar deseos no cambia los resultados. Comprobar que solo el autor y quien deba regalarle leen la lista, incluido el caso de un organizador que también participa.

## Fase 7 Publicación

Crear cuentas de desarrollador, configurar dominio y servicios de producción. Completar privacidad, borrado, soporte, fichas y capturas. Ejecutar TestFlight y pruebas de Google Play aplicables; corregir incidencias y enviar a revisión.

No fijar una fecha pública antes de conocer el alcance de los pagos y los plazos de pruebas y revisión.

## Situación actual

- Completado: análisis inicial, documentación, copia local de Taste Skill y primera base de aplicación en `app/` con pantallas y almacenamiento de ejemplo.
- Infraestructura: proyectos Supabase y Vercel creados; el usuario confirma el despliegue web y un acceso correcto con Google. Región y reglas de datos pendientes de verificar.
- Implementado: cliente Supabase, sesión con Google y PKCE, retorno, recuperación y cierre; variables locales ignoradas por Git. El inicio de sesión web ha sido probado por el usuario; el resto del ciclo de sesión sigue pendiente de confirmar con el proveedor real.
- Implementado: borradores privados con participantes y excepciones, carga y guardado en servidor, copia independiente, RLS y función transaccional con versiones y reintentos. El usuario confirma la migración y el guardado web tras corregir `PGRST201`; la API rechaza consultas anónimas a las tres tablas. Recuperación tras recarga, edición, copia, aislamiento entre cuentas y concurrencia remota siguen pendientes de confirmar.
- Preparado en local: generación en servidor con una ejecución por entidad, bloqueo transaccional, resultados en esquema privado y consulta del destinatario propio por correo confirmado de Auth. La segunda migración aún no se ha aplicado al proyecto remoto y esta entrega no está publicada. La interfaz explica que todavía no se envían correos y que el acceso disponible usa Google.
- Verificado: TypeScript, lint, 29 pruebas de dominio, autenticación, repositorio, generación y privacidad SQL con PostgreSQL embebido, exportación web y consultas HTTP. Incluye 100 participantes, parejas recíprocas, casos imposibles y contraste con un buscador exhaustivo. La exportación de la base anterior para Android e iOS no valida los nuevos flujos en dispositivos.
- Pendiente: completar la revisión visual, pruebas en dispositivos, decisiones detalladas y pruebas de recarga, cierre y errores de sesión con Google real.
- No iniciado: correos reales y su bandeja de tareas, invitados verificados sin cuenta, listas privadas y compras.
- Siguiente hito: aplicar la segunda migración y desplegar la generación y el resultado propio; validar permisos y concurrencia en el servicio real. Después conectar verificación y correos para invitados sin cuenta. Completar las comprobaciones remotas de borradores y sesiones que siguen pendientes. Mantener los datos de ejemplo separados de las cuentas reales.

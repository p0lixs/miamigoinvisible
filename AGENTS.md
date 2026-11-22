# Normas de trabajo

## Instrucciones del usuario

- Analizar el producto, plantear las preguntas necesarias y mantener documentación conforme avance el proyecto.
- Seguir planteando las dudas de producto y diseño que surjan, incorporando las respuestas a la documentación.
- Incorporar en este archivo las nuevas normas que el usuario indique sobre cómo trabajar. Conservar las anteriores salvo que las sustituya expresamente.
- Al finalizar cada tarea, incluir en la respuesta final un mensaje de commit que resuma de forma breve los cambios realizados. Entregar el mensaje no implica crear un commit automáticamente.
- Usar skills de diseño, incluyendo [Taste Skill](https://github.com/Leonxlnx/taste-skill). Leer el skill antes de aplicarlo y respetar las preferencias del usuario cuando haya conflicto.
- El diseño de la aplicación debe ser vistoso, divertido y colorido, con estilo para todo el año.

## Contexto confirmado del producto

- Nombre de la aplicación: «Mi amigo invisible».
- Repositorio GitHub del proyecto: `https://github.com/p0lixs/miamigoinvisible.git`.
- Android en Google Play, iOS en App Store y versión web completa.
- Supabase para guardar los datos e inicio de sesión con Google.
- Invitados sin registro obligatorio. El organizador necesita cuenta.
- Cada participante solo puede consultar su destinatario. El organizador tampoco puede consultar emparejamientos ajenos.
- Crear sorteos con título, descripción, personas y correos, presupuesto obligatorio y orientativo, y excepciones.
- Se permiten parejas recíprocas: dos personas pueden regalarse mutuamente si ninguna excepción lo impide.
- Repetir un sorteo crea una entidad nueva e independiente copiando su configuración y participantes; no modifica el original ni reutiliza sus resultados.
- Excepciones direccionales con opción explícita de hacerlas mutuas.
- Enviar por correo a cada participante la persona a quien debe regalar.
- Acceso por código exclusivamente para personas previamente añadidas; verificar su identidad antes de revelar el resultado.
- Sorteo básico y excepciones gratuitos. La lista de deseos es un extra de pago mediante compra permanente para la cuenta del organizador.
- Las listas de deseos permiten texto, enlaces y fotografías, y se pueden rellenar y modificar antes y después del sorteo, sin exigir registro de organizador a los invitados.
- Solo pueden leer una lista de deseos su autor y, tras sortear, la persona que debe regalarle. El organizador no tiene acceso adicional por ser organizador o comprador.
- Las listas de deseos y su compra permanente estarán disponibles desde el primer lanzamiento público.
- El usuario ha creado los proyectos de Supabase y Vercel para esta aplicación y ha proporcionado sus URL y la clave pública. El proyecto Supabase se solicitó para desarrollo. La web responde por HTTPS y Supabase Auth es accesible. El usuario confirma que ha configurado Google OAuth y los retornos; la consulta pública del 22 de noviembre de 2026 confirma Google habilitado. Faltan las variables de Vercel, publicar el código y validar la sesión real. Región y reglas de datos siguen pendientes de verificar. Consultar `docs/CONFIGURACION-SERVICIOS.md`. Aún no tiene dominio propio ni cuentas de desarrollador de Apple o Google.

## Convenciones iniciales del proyecto

Estas convenciones son propuestas técnicas del análisis inicial; no atribuirlas a instrucciones expresas del usuario.

- Mantener la documentación del proyecto en español, dentro de `docs/`, con índice en `README.md`.
- Distinguir requisitos confirmados, propuestas y decisiones pendientes. Registrar cambios relevantes en `docs/DECISIONES.md`.
- Guardar normas de trabajo aquí y detalles funcionales en la documentación correspondiente.
- No guardar secretos, tokens de invitación ni datos reales de participantes en el repositorio o los logs.
- Mantener las claves privilegiadas y la generación del sorteo en el servidor.
- Verificar especialmente privacidad entre participantes, restricciones del sorteo, concurrencia y reintentos de correos cuando se implemente.
- La copia local de Taste Skill está en `skills/taste-skill/SKILL.md`. Es una referencia para diseño web; adaptar su aplicación al producto móvil, sin reemplazar la arquitectura por una landing estática. Consultar `docs/DISENO.md`.
- La aplicación Expo está en `app/`, con rutas en `app/src/app/` y normas de Expo adicionales en `app/AGENTS.md`. En Windows usar `npm.cmd` y `npx.cmd` cuando PowerShell bloquee los wrappers `.ps1`.
- La raíz Git es `D:/Desarrollo/amigoInvisible`, para incluir aplicación y documentación en el mismo repositorio. El remoto `origin` corresponde al repositorio indicado por el usuario. Consultar `docs/REPOSITORIO.md` antes de reorganizar metadatos Git.
- Los sorteos y deseos del prototipo siguen usando almacenamiento local y escenas de ejemplo, separados de la sesión de Supabase. El código de acceso con Google está preparado, pero no se considerará validado hasta configurar OAuth y probarlo con el proveedor real. No presentar los ejemplos como sorteos realizados, correos enviados, compras verificadas o controles de acceso de producción.

Última actualización: 22 de noviembre de 2026.

# Producto y funcionalidades

## Objetivo

Mi amigo invisible permite organizar un amigo invisible con pocos pasos: crear un grupo, añadir personas, definir restricciones y enviar a cada participante su destinatario. La experiencia debe ser divertida y la gestión del organizador, sencilla.

## Alcance confirmado

| Área | Comportamiento |
| --- | --- |
| Nombre | Mi amigo invisible |
| Plataformas | Android, iOS y web completa |
| Cuenta | Inicio de sesión con Google para organizar; invitados sin registro obligatorio |
| Datos del sorteo | Título, descripción, presupuesto obligatorio y orientativo en EUR y fecha de intercambio opcional |
| Tamaño del grupo | Entre 3 y 100 participantes en la primera versión |
| Participantes | Nombre y correo añadidos por el organizador |
| Excepciones | «Ana no puede regalar a Luis», con opción de prohibir también el sentido inverso |
| Generación | Un destinatario por persona, respetando todas las restricciones |
| Parejas recíprocas | Permitidas si no hay una excepción que las prohíba |
| Comunicación | Correo individual que indica a quién regalar |
| Código | Acceso a un sorteo para personas ya añadidas, tras verificar su identidad |
| Privacidad | Cada persona ve su resultado; el organizador solo el suyo si participa |
| Repetición | Nuevo sorteo independiente a partir de una copia de la configuración |
| Negocio | Sorteo básico y excepciones gratuitos; listas de deseos mediante compra permanente del organizador |
| Listas de deseos | Desde el primer lanzamiento, con texto, enlaces y fotografías; editables antes y después del sorteo |
| Privacidad de deseos | Solo su autor y quien deba regalarle; antes del sorteo, solo el autor |

El organizador puede participar, pero crear el grupo no lo incorpora automáticamente. Se propondrá un control «Yo también participo».

## Flujo del organizador

1. Iniciar sesión y abrir «Crear sorteo».
2. Introducir título, descripción y presupuesto obligatorio y orientativo en EUR. La fecha del intercambio es opcional.
3. Añadir nombres y correos; indicar si también participa.
4. Configurar excepciones. El formulario explica la dirección con nombres completos y ofrece «También al revés».
5. Si se ha activado la lista de deseos, invitar a los participantes para que puedan rellenarla antes de sortear. El momento de envío de estas invitaciones se concretará en la interfaz.
6. Revisar datos y comprobar que existe una combinación válida.
7. Pulsar «Sortear y enviar». Explicar antes que se bloquearán los participantes y las excepciones. Las listas de deseos siguen siendo editables.
8. Consultar el estado de los envíos y reenviar los fallidos sin modificar los emparejamientos.

Los borradores deben poder guardarse y retomarse. El acceso de invitados no permite editar la organización.

## Flujo del participante

El participante recibe un correo con su destinatario y un enlace para abrir el resultado en web o en la app. Propuesta: asunto neutro para que el nombre no aparezca en una notificación de correo.

También puede introducir el código del sorteo y su correo. Si corresponde a una persona añadida, recibe una verificación por correo. El código compartido y el nombre de una persona nunca bastan para acceder a su resultado.

Esta verificación crea acceso limitado al sorteo; no obliga a crear una cuenta de organizador. No se incorpora gente nueva mediante el código. Si se pierde el enlace privado, puede recuperarse mediante una nueva verificación.

Cuando el organizador tiene activadas las listas de deseos, el participante puede entrar mediante una invitación previa, verificar su acceso y escribir sus deseos o subir fotografías. Antes de sortear no hay un destinatario que revelar. Después puede seguir editando sus deseos sin modificar el emparejamiento.

## Repetir un sorteo

Repetir crea un nuevo sorteo independiente, copiando título, descripción, participantes y la configuración del original. El original conserva su identidad y resultados. No supone volver a ejecutar el sorteo sobre la entidad existente ni invalidar automáticamente los resultados anteriores.

Propuesta de implementación: copiar también presupuesto y excepciones; crear nuevos identificadores de sorteo y participantes, remapear las excepciones y generar un código de acceso nuevo. La copia empieza en borrador para poder revisarla antes de invitar o sortear. No copiar emparejamientos, tokens, sesiones ni estados de correo; tampoco enviar correos automáticamente al copiar. Las listas de deseos no se copian por defecto, pendiente de confirmación.

## Listas de deseos

El organizador realiza una compra permanente para su cuenta que habilita esta función en los sorteos que organiza. Los participantes no necesitan comprarla. Cada lista permite texto, enlaces y fotografías, y puede modificarse antes y después del sorteo.

Cada persona edita y consulta su propia lista. Una vez sorteado el grupo, solo la persona que debe regalarle puede consultarla también. Antes del sorteo, solo el autor puede leerla. El organizador no obtiene acceso general por haber pagado; si participa, tiene los mismos permisos que los demás. No publicar listas ni fotografías mediante URLs permanentes accesibles sin autorización.

Las listas y su compra permanente estarán disponibles desde la primera versión pública. Quedan por decidir el precio, los límites de fotografías y si se avisará a quien regala cuando cambien los deseos.

## Reglas propuestas para la primera versión

- Mínimo de 3 participantes y máximo de 100, confirmado para la primera versión.
- Una misma dirección no puede representar a dos personas dentro del mismo sorteo. Definir una política de normalización sin eliminar puntos o sufijos de proveedores de correo.
- Cada persona regala una vez y recibe una vez. Nadie se regala a sí mismo.
- No se exige un único ciclo que incluya a todo el grupo; se respetan las parejas recíprocas permitidas.
- El presupuesto es obligatorio y orientativo en EUR, sin comprobar ni limitar el gasto real. Los borradores pueden estar incompletos, pero es necesario un importe positivo antes de sortear.
- Tras sortear, participantes, correos y excepciones quedan bloqueados; las listas de deseos siguen siendo editables. Para repetir se crea un nuevo sorteo independiente, como se describe arriba.
- Un error de correo no permite volver a sortear. El reenvío conserva el destinatario original.
- El organizador puede gestionar contactos y estados de entrega, pero no abrir enlaces privados de otros participantes.

## Estados

El sorteo pasa de `draft` a `drawn` al guardar de forma completa los emparejamientos. Después puede archivarse o cancelarse. Cancelar invalida accesos y tareas pendientes, pero no puede retirar correos ya recibidos.

El envío tiene un estado independiente: pendiente, en proceso, completo o con incidencias. «Sorteado» y «correos entregados» son hechos distintos. El estado de entrega no demuestra que una persona haya leído su resultado.

## Criterios de aceptación esenciales

| Caso | Resultado esperado |
| --- | --- |
| Restricciones incompatibles | Explicar que no hay solución y permitir editar; no generar resultados parciales |
| Doble clic o dos dispositivos | Un único sorteo y un único conjunto de tareas de correo |
| Falla el envío a una persona | Conservar todos los resultados y reintentar solo el envío necesario |
| Usuario intenta leer otro resultado | Acceso denegado en el servidor, aunque conozca IDs o código |
| Participante sin app ni cuenta | Recibir el resultado por correo y poder abrirlo en web |
| Excepción mutua | Guardar las dos direcciones y mostrarlas de forma comprensible |
| Código o correo desconocido | Respuesta genérica sin revelar quién participa |
| Copiar un sorteo | Nuevo borrador con configuración copiada; sin alterar el original ni reutilizar resultados o accesos |
| Editar deseos después de sortear | Guardar los cambios sin generar ni modificar emparejamientos |
| Organizador con compra permanente | Habilitar listas para sus grupos sin cobro individual a los invitados |
| Lectura de deseos ajenos | Solo quien debe regalar al autor tiene acceso tras el sorteo; denegar al resto, incluido el organizador |
| Sorteo sin presupuesto | Bloquear la acción de sortear e indicar el campo obligatorio |
| Primer lanzamiento público | Incluir listas de deseos y compra permanente, además del sorteo gratuito |

## Alcance adicional pendiente

La lista de deseos es el extra de pago confirmado. Temas visuales y herramientas para grupos grandes no están aprobados como extras. No incluir chat, importación de contactos ni recordatorios automáticos en el alcance inicial sin una decisión posterior.

# Dirección de diseño

## Brief confirmado

Mi amigo invisible es una aplicación de consumo para organizar regalos entre amigos, familiares o compañeros. Debe ser vistosa, divertida y colorida, con estilo para todo el año y dos acciones claras: «Crear sorteo» y «Entrar con código». El nombre está confirmado; el logotipo está pendiente. La identidad principal no debe depender de motivos navideños.

## Propuesta visual

Concepto: una pequeña fiesta de regalos con sobres, lazos y formas de papel. Usar ilustraciones originales y espacios amplios para que el color acompañe la tarea. La experiencia principal es móvil; la web conserva la identidad y adapta el ancho de los formularios.

| Elemento | Propuesta inicial |
| --- | --- |
| Fondo | Crema `#FFF9F1` en el prototipo |
| Texto | Tinta `#202C3E` |
| Acción principal | Azul `#2558D9`, con texto blanco |
| Acentos | Coral `#FF816A`, amarillo `#FFD86A` y menta `#C5EDDA` |
| Tipografía | Fredoka para títulos y Nunito Sans para lectura; se empaquetan únicamente los pesos usados |
| Componentes | Botones grandes, esquinas redondeadas, tarjetas sencillas y avatares con iniciales |
| Ilustración | Regalos y sobres expresivos, consistentes entre pantallas |
| Movimiento | Respuesta al pulsar y apertura breve de un sobre al revelar el resultado |

Los acentos claros son fondos y elementos decorativos, no colores de texto sobre blanco. Validar cada combinación real antes de aprobar los tokens. Esta paleta es una propuesta, no un diseño aprobado.

## Pantallas prioritarias

| Pantalla | Contenido y acción principal |
| --- | --- |
| Bienvenida | Explicación breve, crear sorteo y entrar con código |
| Acceso | Google, opción de Apple propuesta y acceso independiente para invitados |
| Mis sorteos | Grupos creados, grupos a los que se tiene acceso y estados comprensibles |
| Crear sorteo | Asistente por pasos: datos, participantes, excepciones y revisión |
| Excepciones | Selector «quién regala → a quién», control para hacerla mutua y lista editable |
| Revisión | Presupuesto, personas y advertencia sobre bloqueo tras sortear |
| Gestión | Estado de correos, código compartible y acciones disponibles |
| Entrada por código | Código y correo, seguida de verificación |
| Mi resultado | Revelar destinatario, nombre, presupuesto y descripción del grupo |
| Mis deseos | Añadir texto, enlaces y fotografías; editar antes y después del sorteo |
| Deseos de mi destinatario | Consultar únicamente las ideas y fotografías de la persona a quien debe regalar tras el sorteo |
| Activar listas de deseos | Compra permanente del organizador, con restauración y alcance explicado |
| Ajustes | Sesión, privacidad, borrado y restauración de compras desde el primer lanzamiento |

No mostrar correos ni resultados ajenos en animaciones, fondos, listados, vistas previas o capturas automáticas. El resultado propio requiere una acción de revelado en pantalla; el correo individual sí contiene el destinatario, conforme al requisito.

Etiquetar el importe como «Presupuesto orientativo», mostrar que es obligatorio y señalar el error si falta antes de sortear. La acción «Copiar sorteo» abre un borrador nuevo; no sugerir que sustituye o vuelve a ejecutar el original. En las listas de deseos incluir estados de subida, error y eliminación de fotos, y explicar que pueden seguir editándose después del sorteo. Indicar que solo las ve su autor y quien deba regalarle, sin revelar quién es esta última persona.

## Accesibilidad y adaptación

Propuesta de aceptación: texto escalable; foco visible y teclado en web; controles de al menos 44 puntos en iOS y 48 dp en Android; estados expresados con texto además de color. Comprobar lectores de pantalla, zonas seguras, teclado móvil y contraste WCAG AA en las combinaciones usadas.

Reducir o eliminar animaciones con la preferencia de movimiento reducido. El resultado debe estar disponible sin esperar una animación. Probar especialmente nombres largos, errores junto al campo, listas extensas y tamaños de texto grandes. Los mensajes pueden ser cercanos, pero deben explicar cómo resolver el problema.

## Uso de Taste Skill

La copia local está en [SKILL.md](../skills/taste-skill/SKILL.md). Se ha revisado su versión 2.5.1, orientada a sitios corporativos y páginas de producto. Se aplicarán sus criterios de coherencia, jerarquía, controles claros y revisión visual donde correspondan. La instalación local y procedencia están en [skills/README.md](../skills/README.md).

Los flujos de la app necesitan formularios, navegación y controles nativos. Sus reglas de secciones a pantalla completa, plantillas HTML y efectos de landing no definen estas pantallas. Para una futura landing pública sí se evaluará su flujo completo, leyendo antes las referencias que exige y ejecutando sus comprobaciones aplicables.

Existe una primera propuesta implementada en `app/`, descrita en [la guía del prototipo](PROTOTIPO.md). Utiliza Fredoka para títulos y Nunito Sans para texto, con ilustraciones SVG de regalos. Esta dirección todavía no está aprobada visualmente.

Antes de aprobar UI: revisar bienvenida, creación, deseos y resultado en móvil y escritorio; después comprobar en dispositivos reales. El 22 de noviembre de 2026 se han inspeccionado capturas del acceso a 390 y 1440 píxeles y del retorno de cancelación a 390 píxeles, generadas con Taste Skill sobre la exportación web local. La revisión del resto de recorridos y las pruebas en dispositivos siguen pendientes. No añadir más skills sin identificar qué necesidad concreta cubren.

Para la entrega de generación se han revisado con el capturador de Taste Skill el estado realizado en escritorio y el sobre cerrado en móvil, usando sesiones y respuestas ficticias. El resultado propio se solicita solo al pulsar abrir, sin precargar destinatarios en la vista de organización. La confirmación distingue sorteo realizado de correos enviados y explica el bloqueo de participantes y excepciones. Las interacciones completas con el servicio real siguen pendientes de aplicar la segunda migración y desplegar.

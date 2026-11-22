# Registro de decisiones

Fecha inicial: 21 de noviembre de 2026.

## Confirmadas por el usuario

| ID | Decisión |
| --- | --- |
| D01 | Publicar para Android e iOS y ofrecer web completa |
| D02 | Usar Supabase para guardar datos e inicio de sesión con Google |
| D03 | Los invitados pueden recibir resultados sin registrarse |
| D04 | El organizador solo ve su propio destinatario cuando participa |
| D05 | El código sirve para personas ya añadidas; no permite apuntarse libremente |
| D06 | Excepciones direccionales con opción de hacerlas mutuas |
| D07 | Sorteo básico y excepciones gratis, con extras opcionales de pago |
| D08 | Diseño vistoso, divertido y colorido; usar skills, incluyendo Taste Skill |
| D09 | Mantener documentación y añadir futuras normas de trabajo a AGENTS.md |
| D10 | Existen cuentas Supabase y Vercel; cuentas de tiendas y dominio se harán más adelante |
| D11 | El nombre de la aplicación es «Mi amigo invisible» |
| D12 | El presupuesto es obligatorio y orientativo; las monedas siguen pendientes |
| D13 | La lista de deseos es el extra de pago elegido |
| D14 | Repetir copia la configuración y participantes a un sorteo nuevo e independiente |
| D15 | El estilo principal sirve para todo el año |
| D16 | El organizador desbloquea las listas de deseos mediante compra permanente para su cuenta |
| D17 | Las listas de deseos permiten texto, enlaces y fotografías |
| D18 | Los deseos pueden rellenarse y modificarse antes y después del sorteo |
| D19 | Se permiten parejas recíprocas si no hay una excepción que las impida |
| D20 | Solo leen los deseos su autor y, tras sortear, quien deba regalarle; sin privilegios especiales para el organizador |
| D21 | Las listas de deseos y su compra permanente se incluyen desde el primer lanzamiento público |
| D22 | El usuario solo tiene la cuenta Supabase; crear un proyecto de desarrollo nuevo para la aplicación |
| D23 | Repositorio del proyecto: `https://github.com/p0lixs/miamigoinvisible.git` |
| D24 | El usuario confirma que ya ha creado los proyectos de Supabase y Vercel; quedan por verificar la configuración y la conexión con la aplicación |
| D25 | URL proporcionadas: web `https://miamigoinvisible.vercel.app` y Supabase `https://osuagtuwrgohzrnmrgel.supabase.co`; Publishable key recibida y guardada fuera de Git |
| D26 | El usuario confirma el despliegue web y un inicio de sesión correcto con Google; no implica validación completa de sesiones ni persistencia de sorteos |
| D27 | Continuar con la implementación; el usuario elige conectar la integración de Supabase para aplicar la migración de borradores |
| D28 | El usuario acepta continuar con scripts sin depender de la integración de gestión y confirma haber ejecutado la migración de borradores en Supabase |

## Propuestas técnicas

| ID | Propuesta | Validación siguiente |
| --- | --- | --- |
| P01 | Expo, React Native, Expo Router y TypeScript | Flujo mínimo de autenticación y enlaces en tres plataformas |
| P02 | Web en Vercel y backend en Supabase | Exportación, rutas directas y permisos |
| P03 | Añadir Sign in with Apple en iOS | Configuración de credenciales y revisión del login |
| P04 | Proveedor transaccional y bandeja persistente para correos | Elegir proveedor, dominio y política de reintentos |
| P05 | Una ejecución por entidad; la copia confirmada comienza como borrador sin resultados ni accesos heredados | Definir copia de deseos y cancelación |
| P06 | De 3 a 100 participantes inicialmente | Confirmar límites; las parejas recíprocas ya están permitidas |
| P07 | Verificación por correo y sesión limitada para invitados | Prueba de acceso y recuperación |
| P08 | Evaluar RevenueCat | Validar compra permanente de listas de deseos, precio y restauración |

Estas propuestas permiten avanzar en diseño y pruebas; no representan decisiones expresas del usuario.

## Supuestos del prototipo

La primera base en `app/` usa euros, fecha opcional y listas de deseos vacías al copiar un sorteo para permitir explorar el flujo. El usuario ha indicado continuar, pero no ha respondido esas tres preguntas; siguen pendientes y no se consideran requisitos confirmados. Los límites provisionales son de 3 a 100 participantes y hasta 3 fotos de 5 MB por deseo.

## Preguntas pendientes

| Prioridad | Pregunta | Propuesta inicial |
| --- | --- | --- |
| Antes del diseño definitivo | ¿Logotipo concreto de la marca? | Nombre confirmado y estilo para todo el año; regalos y sobres como propuesta |
| Antes de cerrar el catálogo | ¿Precio de la compra permanente de listas de deseos? | Tipo de compra y presencia en el primer lanzamiento confirmados; concretar precio |
| Antes de cerrar el formulario | ¿Solo EUR o varias monedas? ¿Fecha del intercambio? | Presupuesto obligatorio y orientativo confirmado; EUR y fecha opcional como propuesta |
| Antes del algoritmo final | ¿Se aceptan mínimo 3 y máximo inicial 100? | Sí, como propuesta técnica revisable |
| Antes de gestionar incidencias | ¿Cómo cancelar o corregir un correo después del sorteo? | Repetición como entidad nueva confirmada; recuperación verificada sin reasignar como propuesta |
| Antes de cerrar la copia | ¿Se copian también las listas de deseos? | No copiar contenido ni fotos de los participantes por defecto |
| Antes de habilitar imágenes | ¿Límites de fotos y avisos al cambiar deseos? | Fijar cuotas de tamaño y cantidad; avisos aún no definidos |
| Antes de publicar | ¿Borrado, conservación de grupos y cuentas? | Política explícita con tratamiento de grupos activos |
| Antes de cerrar la prueba de acceso | ¿La sesión se mantiene al recargar y se cierra correctamente? ¿Región de Supabase elegida? | Despliegue y acceso con Google confirmados por el usuario. Frankfurt y ajustes de tablas fueron recomendaciones, no configuración verificada |
| Antes de las tiendas | ¿Territorios, idiomas, público y fecha objetivo? | Prototipo en español, sin asumir todavía mercados ni edad |

## Historial

- 22 de noviembre de 2026: el usuario opta por los scripts y confirma ejecutar la migración en Supabase. Las consultas remotas con Publishable key y sin sesión a las tres tablas devuelven HTTP 401 y `42501`; no se han leído filas. Añadido un verificador SQL de solo lectura y probado en PostgreSQL embebido antes y después de la migración y con RLS deshabilitado. Pendientes el despliegue del código local, la ejecución remota del verificador y las pruebas autenticadas entre cuentas.
- 22 de noviembre de 2026: implementados en local los borradores privados de cuenta, guardado transaccional con versión y reintentos, copia independiente y separación de la demo. Preparada la primera migración y comprobadas sus políticas en PostgreSQL embebido con usuarios ficticios. El usuario elige conectar Supabase para aplicarla; la integración todavía no figura instalada/conectada. No se ha aplicado SQL al proyecto remoto ni publicado esta entrega.
- 22 de noviembre de 2026: el usuario confirma que la web ya se ha desplegado y ha podido acceder con Google. Se registra el inicio de sesión real como comprobación realizada por el usuario. Permanencia tras recarga, cierre, cancelación, errores y dispositivos móviles siguen pendientes; los sorteos y deseos continúan siendo ejemplos locales.
- 22 de noviembre de 2026: el usuario confirma completar la configuración de Google OAuth, el proveedor de Supabase y las URL de retorno. Una nueva consulta pública de Auth confirma Google habilitado. Pendientes las variables en Vercel, la publicación del código local y la validación del acceso con una cuenta real; no basta con redesplegar la versión anterior.
- 22 de noviembre de 2026: recibidas URL y Publishable key. Comprobadas respuestas HTTP 200 en `/` y `/acceso` de Vercel y acceso a los ajustes públicos de Supabase Auth, que indican Google desactivado. Implementado acceso con PKCE, recuperación y cierre de sesión en el código local, separado de los datos de la demo. Preparada la guía de configuración con retornos concretos. No se han modificado ajustes remotos, creado usuarios, aplicado migraciones ni desplegado estos cambios.
- 22 de noviembre de 2026: el usuario confirma la creación de los proyectos Supabase y Vercel. Se propone como siguiente hito verificar el despliegue, integrar Google y probar las sesiones; después, persistir borradores con permisos por organizador. No se han consultado los proyectos remotos ni aplicado migraciones. Las integraciones de Supabase y Vercel no están instaladas en esta sesión.
- 22 de noviembre de 2026: vinculado `origin` al repositorio GitHub del usuario, con rama local `main` y raíz única para documentación y aplicación. La consulta del remoto no devuelve ramas publicadas. El historial inicial de Expo se conserva en una copia local verificada mediante SHA256; no se han creado commits ni publicado archivos.
- 21 de noviembre de 2026: confirmado que no hay proyecto Supabase y que debe crearse uno de desarrollo. Se ha localizado la integración, todavía sin instalar ni conectar; no se ha creado infraestructura.
- 21 de noviembre de 2026: creada la primera base Expo y el prototipo local con datos ficticios, asistente de creación, excepciones, copia, escena de resultado y deseos. Documentados los supuestos provisionales y las integraciones pendientes; sin despliegue ni operaciones reales.
- 21 de noviembre de 2026: confirmados presupuesto obligatorio, lectura de deseos solo por su autor y quien deba regalarle, y listas con compra permanente desde el primer lanzamiento. Reorganizado el plan para incluir este alcance antes de publicar.
- 21 de noviembre de 2026: confirmados presupuesto orientativo, copia como sorteo nuevo, estilo para todo el año y listas de deseos de pago. Confirmadas compra permanente del organizador, inclusión de texto, enlaces y fotos, edición antes y después del sorteo y parejas recíprocas permitidas.
- 21 de noviembre de 2026: confirmado el nombre «Mi amigo invisible». Continúa la definición del presupuesto, extras de pago, repetición de sorteos e identidad visual; las preguntas planteadas aún no constituyen decisiones.
- 21 de noviembre de 2026: requisitos iniciales y respuestas incorporados. Preparadas propuestas de producto, arquitectura, privacidad, diseño y publicación. Taste Skill 2.5.1 copiado dentro del proyecto para lectura explícita.

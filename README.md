# Mi amigo invisible

Repositorio: [p0lixs/miamigoinvisible](https://github.com/p0lixs/miamigoinvisible).

Mi amigo invisible es una aplicación para organizar sorteos de amigo invisible desde Android, iOS y web. Cada persona recibe por correo a quién debe regalar, respetando las excepciones del grupo y manteniendo privados los resultados.

El presupuesto es obligatorio y orientativo, y el estilo visual sirve para todo el año. El sorteo básico es gratuito; la lista de deseos, con texto, enlaces y fotografías, se desbloquea mediante una compra permanente del organizador desde el primer lanzamiento. Solo pueden leerla su autor y quien deba regalarle. Repetir un sorteo crea uno nuevo copiando su configuración.

## Estado actual

Base ejecutable, a 22 de noviembre de 2026. El usuario confirma el despliegue en Vercel, un inicio de sesión correcto con Google y la ejecución de la migración de borradores en Supabase. La API reconoce las tablas y rechaza consultas anónimas. El código local de los borradores privados está preparado; falta publicar esta entrega y validar el guardado y el aislamiento con sesiones reales. La demo local queda separada de la cuenta. La permanencia de la sesión al recargar, su cierre y los casos de error con el proveedor real siguen pendientes de confirmar. Todavía no hay generación real de sorteos, correos ni compras conectadas.

La base utiliza React Native, Expo Router y TypeScript. Se mantiene la propuesta de Supabase para autenticación, datos y operaciones del servidor, y Vercel para alojar la web. La propuesta y sus alternativas están en la arquitectura.

## Ejecutar el prototipo

Desde PowerShell, en la raíz del proyecto:

```powershell
cd app
npm.cmd install
npm.cmd run web
```

Abrir la dirección local que muestre Expo. Las dependencias ya están instaladas en este entorno. La [guía del prototipo](docs/PROTOTIPO.md) explica los recorridos, las comprobaciones y lo que falta conectar.

## Documentación

| Documento | Contenido |
| --- | --- |
| [Producto](docs/PRODUCTO.md) | Funcionalidades, flujos y criterios de aceptación |
| [Prototipo ejecutable](docs/PROTOTIPO.md) | Cómo abrirlo, pantallas disponibles y limitaciones |
| [Repositorio](docs/REPOSITORIO.md) | Vinculación con GitHub y organización de Git |
| [Arquitectura](docs/ARQUITECTURA.md) | Plataformas, servicios, sorteo y correos |
| [Datos y seguridad](docs/DATOS-Y-SEGURIDAD.md) | Entidades, permisos y acceso privado |
| [Diseño](docs/DISENO.md) | Dirección visual y pantallas |
| [Publicación y pagos](docs/PUBLICACION-Y-PAGOS.md) | Tiendas, infraestructura y monetización |
| [Conexión de servicios](docs/CONFIGURACION-SERVICIOS.md) | Variables, Google OAuth, retornos y comprobación de sesiones |
| [Borradores privados](docs/BORRADORES.md) | Guardado en Supabase, permisos, versiones, reintentos y migración |
| [Plan de desarrollo](docs/PLAN.md) | Fases y validaciones |
| [Decisiones](docs/DECISIONES.md) | Acuerdos, propuestas y preguntas pendientes |
| [Normas de trabajo](AGENTS.md) | Instrucciones persistentes para trabajar en el proyecto |
| [Skills de diseño](skills/README.md) | Procedencia y uso de Taste Skill |

## Próximo hito

Publicar el código de [borradores privados](docs/BORRADORES.md) en Vercel y validar guardado, recarga, copia, aislamiento entre dos cuentas y cambios concurrentes mediante la API real. La migración ya está ejecutada según confirma el usuario; el verificador SQL de solo lectura está disponible para revisar el catálogo y los permisos desde el panel. Completar también la [validación de sesiones](docs/CONFIGURACION-SERVICIOS.md#validación) antes de conectar sorteos y resultados.

Moneda, fecha del intercambio y copia de deseos siguen pendientes; el prototipo utiliza provisionalmente euros, fecha opcional y listas vacías al copiar. Las cuentas de las tiendas y el dominio se configurarán en una fase posterior.

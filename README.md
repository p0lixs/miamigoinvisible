# Mi amigo invisible

Repositorio: [p0lixs/miamigoinvisible](https://github.com/p0lixs/miamigoinvisible).

Mi amigo invisible es una aplicación para organizar sorteos de amigo invisible desde Android, iOS y web. Cada persona recibe por correo a quién debe regalar, respetando las excepciones del grupo y manteniendo privados los resultados.

El presupuesto es obligatorio y orientativo, y el estilo visual sirve para todo el año. El sorteo básico es gratuito; la lista de deseos, con texto, enlaces y fotografías, se desbloquea mediante una compra permanente del organizador desde el primer lanzamiento. Solo pueden leerla su autor y quien deba regalarle. Repetir un sorteo crea uno nuevo copiando su configuración.

## Estado actual

Base ejecutable, a 22 de noviembre de 2026. La aplicación Expo está en `app/` e incluye un prototipo navegable con almacenamiento local y datos ficticios. La web publicada responde y Supabase Auth es accesible. El código del acceso con Google, retorno y cierre de sesión está preparado. El usuario confirma OAuth y los retornos configurados, y la consulta pública confirma Google habilitado. Faltan las variables de Vercel, publicar los cambios y validar el flujo real. Todavía no hay esquema de sorteos, envío de correos ni compras conectadas.

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
| [Plan de desarrollo](docs/PLAN.md) | Fases y validaciones |
| [Decisiones](docs/DECISIONES.md) | Acuerdos, propuestas y preguntas pendientes |
| [Normas de trabajo](AGENTS.md) | Instrucciones persistentes para trabajar en el proyecto |
| [Skills de diseño](skills/README.md) | Procedencia y uso de Taste Skill |

## Próximo hito

Completar la [configuración de Google y Vercel](docs/CONFIGURACION-SERVICIOS.md), publicar el código de autenticación y probar inicio, recuperación y cierre de sesión con el proveedor real. Después, implementar borradores en servidor con permisos por organizador y comprobar el aislamiento entre dos cuentas antes de conectar sorteos y resultados.

Moneda, fecha del intercambio y copia de deseos siguen pendientes; el prototipo utiliza provisionalmente euros, fecha opcional y listas vacías al copiar. Las cuentas de las tiendas y el dominio se configurarán en una fase posterior.

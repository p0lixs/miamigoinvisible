# Mi amigo invisible

Repositorio: [p0lixs/miamigoinvisible](https://github.com/p0lixs/miamigoinvisible).

Mi amigo invisible es una aplicación para organizar sorteos de amigo invisible desde Android, iOS y web. Cada persona recibe por correo a quién debe regalar, respetando las excepciones del grupo y manteniendo privados los resultados.

El presupuesto es obligatorio y orientativo, y el estilo visual sirve para todo el año. El sorteo básico es gratuito; la lista de deseos, con texto, enlaces y fotografías, se desbloquea mediante una compra permanente del organizador desde el primer lanzamiento. Solo pueden leerla su autor y quien deba regalarle. Repetir un sorteo crea uno nuevo copiando su configuración.

## Estado actual

Base ejecutable, a 22 de noviembre de 2026. El usuario confirma el despliegue en Vercel, el inicio de sesión con Google, la migración de borradores en Supabase y el guardado de un borrador desde la web tras corregir `PGRST201`. La API reconoce las tablas y rechaza consultas anónimas. La recuperación tras recarga, edición, copia, aislamiento entre cuentas y concurrencia remota siguen pendientes de confirmar. La demo local queda separada de la cuenta. El cierre y los errores de sesión con el proveedor real también siguen pendientes. Todavía no hay generación real de sorteos, correos ni compras conectadas.

La siguiente entrega ya está preparada en local: generación transaccional del sorteo, bloqueo de edición y consulta del destinatario propio mediante el correo confirmado de Auth. Requiere aplicar la segunda migración y publicar el código. Los correos y los invitados sin cuenta siguen pendientes. La base utiliza React Native, Expo Router y TypeScript, Supabase para autenticación y datos, y Vercel para la web.

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
| [Generación y resultado propio](docs/SORTEOS.md) | Segunda migración, algoritmo, privacidad, confirmación y despliegue |
| [Plan de desarrollo](docs/PLAN.md) | Fases y validaciones |
| [Decisiones](docs/DECISIONES.md) | Acuerdos, propuestas y preguntas pendientes |
| [Normas de trabajo](AGENTS.md) | Instrucciones persistentes para trabajar en el proyecto |
| [Skills de diseño](skills/README.md) | Procedencia y uso de Taste Skill |

## Próximo hito

Aplicar la [segunda migración](docs/SORTEOS.md) y desplegar la generación y el resultado propio. Probar con cuentas y participantes ficticios las restricciones, el bloqueo de edición, los reintentos y el aislamiento de resultados. Completar también las pruebas remotas de borradores y de sesiones que siguen pendientes. El guardado web ya está confirmado por el usuario.

EUR, fecha opcional y entre 3 y 100 participantes están confirmados para la primera versión. La copia de deseos sigue pendiente de decidir; actualmente las listas se dejan vacías al copiar. Las cuentas de las tiendas y el dominio se configurarán en una fase posterior.

# Mi amigo invisible

Aplicación universal con Expo Router y TypeScript. Incluye una demo local sin sesión y borradores privados de cuenta mediante Supabase. El usuario confirma que ha ejecutado la migración; la API reconoce las tablas y rechaza consultas anónimas. Falta publicar el código de esta entrega y probar el guardado y el aislamiento con sesiones reales. El usuario confirma el inicio de sesión con Google en la web anterior; recarga, cierre y errores con el proveedor real siguen pendientes de confirmar. No genera sorteos reales, envía correos ni procesa compras.

## Desarrollo

Requiere Node.js LTS compatible con Expo SDK 58. En Windows se ha utilizado Node 24 y npm mediante sus ejecutables `.cmd`.

```powershell
npm.cmd install
npm.cmd run web
```

Para iniciar el servidor de desarrollo móvil: `npm.cmd start`. La instalación y ejecución en iOS y Android todavía necesitan validarse en un dispositivo o entorno de desarrollo compatible.

## Comprobaciones

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build:web
```

Vercel utiliza `app/` como directorio raíz y `dist/` como salida. La web está publicada en `https://miamigoinvisible.vercel.app`, con acceso mediante Google confirmado por el usuario. Copiar `.env.example` a `.env.local` y completar la URL y Publishable key de Supabase; la configuración local ya está preparada en este equipo. El cliente lee estas variables y conserva la sesión por separado de los datos de la demo. Consultar la [configuración de servicios](../docs/CONFIGURACION-SERVICIOS.md) para reproducir la configuración y completar las pruebas de sesión.

Consultar [Borradores privados](../docs/BORRADORES.md) para la migración y las pruebas de permisos, la [guía del prototipo](../docs/PROTOTIPO.md), la [documentación del producto](../docs/PRODUCTO.md) y las [normas generales](../AGENTS.md).

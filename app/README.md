# Mi amigo invisible

Aplicación universal con Expo Router y TypeScript. Los sorteos y deseos siguen siendo un prototipo local con datos ficticios. Incluye código de acceso con Google mediante Supabase, pendiente de configuración OAuth y verificación real. No genera sorteos reales, envía correos ni procesa compras.

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

Vercel utiliza `app/` como directorio raíz y `dist/` como salida. La versión anterior está publicada en `https://miamigoinvisible.vercel.app`; estos cambios aún no están desplegados. Copiar `.env.example` a `.env.local` y completar la URL y Publishable key de Supabase; la configuración local ya está preparada en este equipo. El cliente lee estas variables y conserva la sesión por separado de los datos de la demo. Consultar la [configuración de servicios](../docs/CONFIGURACION-SERVICIOS.md) para activar Google y preparar las variables de Vercel.

Consultar la [guía del prototipo](../docs/PROTOTIPO.md), la [documentación del producto](../docs/PRODUCTO.md) y las [normas generales](../AGENTS.md).

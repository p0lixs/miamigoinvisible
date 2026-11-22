# Mi amigo invisible

Aplicación universal con Expo Router y TypeScript. Esta versión es un prototipo local: usa datos ficticios, no genera sorteos reales y no envía correos ni procesa compras.

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

La configuración de Vercel está preparada para usar `app/` como directorio raíz y `dist/` como salida. No hay despliegue realizado. El archivo `.env.example` reserva los valores públicos futuros de Supabase; todavía no se leen ni conectan a un servicio.

Consultar la [guía del prototipo](../docs/PROTOTIPO.md), la [documentación del producto](../docs/PRODUCTO.md) y las [normas generales](../AGENTS.md).

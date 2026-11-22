# Prototipo de Mi amigo invisible

## Alcance disponible

La primera base se encuentra en `app/`, con Expo SDK 58, React Native, Expo Router y TypeScript. Se utiliza una cuenta ficticia de Ana y dos grupos de ejemplo. Los nombres y correos no pertenecen a participantes reales.

| Recorrido | Comportamiento implementado |
| --- | --- |
| Mis sorteos | Listado y filtros entre todos, borradores y sorteados |
| Crear y editar | Asistente con datos, participantes, excepciones dirigidas o mutuas y revisión |
| Presupuesto | Obligatorio antes de completar el asistente; admite euros y céntimos, sin coma flotante para los importes |
| Guardar y salir | Conserva un borrador local, aunque todavía esté incompleto |
| Copiar sorteo | Crea identificadores nuevos y remapea las excepciones, sin heredar resultados o deseos |
| Resultado propio | Revela el destinatario fijo de la escena ficticia; no realiza una generación aleatoria |
| Mis deseos | Añadir, editar y eliminar texto y enlaces; seleccionar fotos para la sesión |
| Deseos del destinatario | Consulta de la lista ficticia de la persona asignada a Ana |
| Código e inicio de sesión | Pantallas preparadas que explican que falta conectar la verificación real |
| Compra permanente | Explicación del extra y restauración pendiente, sin precio inventado ni cobros simulados |

La interfaz utiliza regalos ilustrados en SVG, títulos Fredoka, texto Nunito Sans, fondos claros y acentos azul, coral, amarillo y menta. Las fuentes se empaquetan con la app y las ilustraciones están construidas como componentes compatibles con las tres plataformas.

## Ejecución local

Desde la raíz del proyecto, en PowerShell:

```powershell
cd app
npm.cmd install
npm.cmd run web
```

Abrir la dirección local que imprima Expo. Los wrappers `.cmd` evitan el bloqueo de scripts `.ps1` observado en este equipo, sin modificar la política de ejecución de PowerShell.

Para preparar la web exportada: `npm.cmd run build:web`. La salida está en `app/dist/`. Vercel debe usar `app/` como directorio raíz y la configuración incluida en `app/vercel.json`; aún no se ha desplegado.

## Datos y límites del prototipo

Los borradores y los deseos de texto se conservan mediante AsyncStorage en este dispositivo o navegador. Las fotografías permanecen en memoria durante la sesión; no se suben ni se sincronizan. Para explorar se han fijado límites provisionales de 3 fotos por deseo y 5 MB por foto, con JPG, PNG y WebP.

El ejemplo contiene los datos necesarios para mostrar las pantallas; no implementa aislamiento de datos de producción. No utilizarlo con datos personales reales. La privacidad efectiva deberá verificarse en el servidor y en Supabase Storage al conectar los servicios.

La generación de emparejamientos queda reservada al backend. «Revisar para sortear» comprueba los campos básicos y explica que falta la validación de restricciones y la generación en servidor; no anuncia un sorteo realizado ni un correo enviado.

Euros, fecha opcional y listas vacías al copiar son supuestos exclusivos del prototipo, pendientes de respuesta. El precio y los límites definitivos siguen pendientes.

## Verificación

Se han ejecutado TypeScript, lint y cuatro pruebas del dominio: validación exacta del presupuesto, copia independiente sin resultados heredados, enlaces y fechas válidas, y correo duplicado. Se ha exportado JavaScript para web, Android e iOS. Se han comprobado respuestas HTTP 200 en `/`, `/nuevo`, `/deseos` y `/sorteo/pandilla` del servidor de desarrollo. La matriz de versiones de Expo indica que las dependencias están actualizadas.

La revisión visual e interacción en navegador no se han podido realizar: el servicio de automatización de esta sesión no tiene ningún navegador disponible. Tampoco se ha comprobado la interfaz en dispositivos Android o iOS ni se han generado binarios firmados. La exportación de JavaScript no sustituye esas verificaciones.

Se ha aplicado un override de `minimatch` a 11.0.1 únicamente bajo `@expo/fingerprint` para resolver el [aviso GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) de la cadena de compilación. La instalación posterior informa de cero vulnerabilidades. Revisar y retirar el override cuando Expo incorpore la corrección.

## Siguiente integración

Configurar un proyecto de desarrollo Supabase, migraciones y permisos; conectar Google y el acceso de invitados; implementar generación transaccional y correo persistente; subir fotos a Storage privado; integrar compra permanente y restauración. Las listas y los pagos forman parte del alcance del primer lanzamiento, aunque esta primera base aún no los conecta.

El usuario ha confirmado crear un proyecto Supabase de desarrollo nuevo. La integración está disponible, pero no está instalada ni conectada a su cuenta en esta sesión; no se ha creado ningún proyecto. Es necesario instalarla y conectarla para realizar esa operación desde aquí.

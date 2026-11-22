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
| Inicio de sesión | Google mediante Supabase y PKCE, recuperación y cierre de sesión implementados; pendientes de configurar OAuth y validar con el proveedor real |
| Código de invitación | Pantalla de ejemplo; falta conectar la verificación real |
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

Para preparar la web exportada: `npm.cmd run build:web`. La salida está en `app/dist/`. Vercel utiliza `app/` como directorio raíz y la configuración incluida en `app/vercel.json`. La versión publicada responde HTTP 200 en `https://miamigoinvisible.vercel.app/` y `/acceso`; los cambios de autenticación todavía no están publicados. Consultar la [configuración de servicios](CONFIGURACION-SERVICIOS.md).

## Datos y límites del prototipo

Los borradores y los deseos de texto se conservan mediante AsyncStorage en este dispositivo o navegador. Las fotografías permanecen en memoria durante la sesión; no se suben ni se sincronizan. Para explorar se han fijado límites provisionales de 3 fotos por deseo y 5 MB por foto, con JPG, PNG y WebP.

La sesión de Supabase se conserva mediante su SDK, separada del almacén de la demo. Entrar con Google no convierte los borradores de Ana en sorteos de la cuenta. El acceso real está pendiente de configurar y verificar con Google; Apple y el acceso verificado por código siguen pendientes.

El ejemplo contiene los datos necesarios para mostrar las pantallas; no implementa aislamiento de datos de producción. No utilizarlo con datos personales reales. La privacidad efectiva deberá verificarse en el servidor y en Supabase Storage al conectar los servicios.

La generación de emparejamientos queda reservada al backend. «Revisar para sortear» comprueba los campos básicos y explica que falta la validación de restricciones y la generación en servidor; no anuncia un sorteo realizado ni un correo enviado.

Euros, fecha opcional y listas vacías al copiar son supuestos exclusivos del prototipo, pendientes de respuesta. El precio y los límites definitivos siguen pendientes.

## Verificación

Se han ejecutado TypeScript, lint y ocho pruebas: cuatro del dominio de sorteos y cuatro de configuración y autenticación. Las de autenticación utilizan el SDK real con respuestas simuladas para comprobar PKCE, verificador por flujo, retornos duplicados, persistencia, cierre y errores. La exportación web incluye los nuevos módulos. La base anterior también se exportó para Android e iOS; no equivale a validar el acceso en dispositivos. Se han comprobado respuestas HTTP 200 en `/`, `/nuevo`, `/deseos` y `/sorteo/pandilla` del servidor de desarrollo, y en `/` y `/acceso` de la web publicada.

Se ha revisado el acceso exportado mediante capturas de Taste Skill a 390 y 1440 píxeles, y el retorno de cancelación a 390 píxeles, con un servidor local que reproduce el retorno a la SPA. Las capturas se conservan en `.local/auth-qa/`, fuera de Git. El servidor `expo serve` no aplicó ese retorno para `/acceso`, por lo que no se utilizó para aprobar las rutas. La revisión del resto de pantallas, las interacciones con Google real y la interfaz en dispositivos Android o iOS siguen pendientes. No se han generado binarios firmados.

Se ha aplicado un override de `minimatch` a 11.0.1 únicamente bajo `@expo/fingerprint` para resolver el [aviso GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249) de la cadena de compilación. La instalación posterior informa de cero vulnerabilidades. Revisar y retirar el override cuando Expo incorpore la corrección.

## Siguiente integración

Añadir variables en Vercel y publicar este código; el usuario ya confirma OAuth y retornos configurados. Probar las sesiones con el proveedor real antes de crear migraciones y permisos para los borradores. Después, conectar el acceso de invitados; implementar generación transaccional y correo persistente; subir fotos a Storage privado; integrar compra permanente y restauración. Las listas y los pagos forman parte del alcance del primer lanzamiento, aunque esta primera base aún no los conecta.

El usuario ha proporcionado las URL de Supabase y Vercel y la Publishable key. La configuración local está preparada, la web responde y el endpoint público de Supabase Auth confirma Google habilitado tras la configuración realizada por el usuario. Las integraciones de gestión no están conectadas en esta sesión; el agente no ha aplicado migraciones ni modificado los ajustes remotos.

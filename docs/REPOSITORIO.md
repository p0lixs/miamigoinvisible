# Repositorio del proyecto

Repositorio indicado por el usuario: [p0lixs/miamigoinvisible](https://github.com/p0lixs/miamigoinvisible), con URL Git `https://github.com/p0lixs/miamigoinvisible.git`.

La raíz local es `D:/Desarrollo/amigoInvisible`. Así se versionan juntos `app/`, `docs/`, `skills/`, `AGENTS.md` y el índice del proyecto. En Vercel, el directorio raíz de compilación de la aplicación sigue siendo `app/`.

## Configuración local

El remoto se configura como `origin` y la rama local inicial es `main`. El 22 de noviembre de 2026, `git ls-remote` terminó correctamente sin devolver ramas o HEAD publicados en el remoto. Esta comprobación no verifica permisos de escritura.

Expo había creado un repositorio independiente en `app/.git`, con un commit inicial `8a8ab0e`. Sus metadatos se conservan en `.local/git-history/expo-app`, una carpeta ignorada por Git. Los archivos de la aplicación permanecen en `app/`; no se restaura ni se sobrescribe su contenido al preparar la raíz.

Esta preparación no crea un commit del proyecto ni publica archivos en GitHub. Antes de la primera subida, revisar el contenido que vaya a añadirse y comprobar otra vez el estado del remoto para detectar posibles cambios posteriores.

## Archivos locales

Los `.gitignore` excluyen dependencias, compilaciones, credenciales y copias locales de metadatos. `.env.example` contiene únicamente nombres de variables con valores vacíos y puede versionarse. Mantener las claves secretas fuera del repositorio.

import { ScrollViewStyleReset } from "expo-router/html";
import type { PropsWithChildren } from "react";
export default function Html({ children }: PropsWithChildren) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#FFF9F1" />
        <meta
          name="description"
          content="Mi amigo invisible: organiza regalos, guarda tus deseos y comparte la ilusión."
        />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <title>Mi amigo invisible</title>
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "body { background: #FFF9F1; } :focus-visible { outline: 3px solid #2558D9; outline-offset: 4px; } @media(prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; scroll-behavior: auto !important; } }",
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

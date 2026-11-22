import { useEffect, useState } from "react";
import { Platform, View } from "react-native";
import * as Linking from "expo-linking";
import { router } from "expo-router";
import { Shell } from "../../components/Shell";
import { Button, Card, Heading, Loading, Notice } from "../../components/ui";
import { useAuth } from "../../auth/session";
import { AuthFlowError } from "../../domain/auth";

export default function AuthCallback() {
  const nativeUrl = Linking.useLinkingURL();
  const [webUrl] = useState(() =>
    Platform.OS === "web" ? window.location.href : null,
  );
  const [error, setError] = useState<string | null>(null);
  const { completeSignIn } = useAuth();
  const url = webUrl ?? nativeUrl;
  useEffect(() => {
    if (!url) return;
    let active = true;
    // Limpiar el código del historial antes de mostrar otras pantallas o enlaces.
    if (Platform.OS === "web")
      window.history.replaceState(
        window.history.state,
        "",
        window.location.pathname,
      );
    completeSignIn(url)
      .then(() => {
        if (active) router.replace("/cuenta");
      })
      .catch((cause) => {
        if (active)
          setError(
            cause instanceof AuthFlowError
              ? cause.message
              : "No se ha podido completar el acceso.",
          );
      });
    return () => {
      active = false;
    };
  }, [url, completeSignIn]);
  return (
    <Shell>
      <View style={{ maxWidth: 520, width: "100%", alignSelf: "center" }}>
        <Card>
          <Heading size={28}>
            {error ? "Vamos a intentarlo otra vez" : "Preparando tu cuenta"}
          </Heading>
          {error ? (
            <>
              <Notice error>{error}</Notice>
              <Button onPress={() => router.replace("/acceso")}>
                Volver al acceso
              </Button>
            </>
          ) : (
            <Loading />
          )}
        </Card>
      </View>
    </Shell>
  );
}

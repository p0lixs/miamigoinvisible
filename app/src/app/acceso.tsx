import { Redirect, router } from "expo-router";
import { View } from "react-native";
import { Shell } from "../components/Shell";
import { Body, Button, Card, Heading, Loading, Notice } from "../components/ui";
import { GiftArt } from "../components/GiftArt";
import { useAuth } from "../auth/session";
export default function Login() {
  const { session, ready, busy, configured, error, signInWithGoogle } =
    useAuth();
  if (!ready)
    return (
      <Shell>
        <Loading />
      </Shell>
    );
  if (session) return <Redirect href="/cuenta" />;
  return (
    <Shell>
      <View
        style={{ maxWidth: 520, width: "100%", alignSelf: "center", gap: 22 }}
      >
        <View style={{ alignItems: "center" }}>
          <GiftArt size={210} />
        </View>
        <Heading size={34}>Las mejores sorpresas empiezan contigo.</Heading>
        <Body muted>Entra para crear tus sorteos y reunir a tu gente.</Body>
        <Card>
          <Button
            disabled={!configured || busy}
            onPress={() => void signInWithGoogle()}
          >
            {busy ? "Conectando con Google…" : "Continuar con Google"}
          </Button>
          <Button variant="secondary" disabled>
            Continuar con Apple
          </Button>
          <Body muted style={{ fontSize: 14 }}>
            {configured
              ? "Con Google crearás tu cuenta o entrarás en ella. Apple estará disponible más adelante."
              : "El acceso con Google estará disponible cuando se complete la configuración. Puedes explorar la demo mientras tanto."}
          </Body>
          {error && <Notice error>{error}</Notice>}
        </Card>
        <Notice>
          Los sorteos de la demo son de ejemplo y se guardan solo en este
          dispositivo. Iniciar sesión no los incorpora a tu cuenta.
        </Notice>
        <Button variant="secondary" onPress={() => router.replace("/")}>
          Explorar como Ana
        </Button>
        <Button variant="quiet" onPress={() => router.push("/entrar")}>
          Tengo un código de invitación
        </Button>
      </View>
    </Shell>
  );
}

import { router } from "expo-router";
import { View } from "react-native";
import { Shell } from "../components/Shell";
import { Body, Button, Card, Heading, Notice } from "../components/ui";
import { GiftArt } from "../components/GiftArt";
export default function Login() {
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
          <Button disabled>Continuar con Google</Button>
          <Button variant="secondary" disabled>
            Continuar con Apple
          </Button>
          <Body muted style={{ fontSize: 14 }}>
            El inicio de sesión se activará al configurar Supabase y los
            proveedores. Estos botones aún no crean una sesión.
          </Body>
        </Card>
        <Notice>
          Puedes recorrer la aplicación con una cuenta de ejemplo sin
          registrarte.
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

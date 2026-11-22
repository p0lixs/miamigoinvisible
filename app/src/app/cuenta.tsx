import { router } from "expo-router";
import { View } from "react-native";
import { Shell } from "../components/Shell";
import {
  Avatar,
  Body,
  Button,
  Card,
  Chip,
  Heading,
  Loading,
  Notice,
  s,
} from "../components/ui";
import { useAuth } from "../auth/session";
export default function Account() {
  const { session, ready, busy, error, signOut } = useAuth();
  const fullName: unknown = session?.user.user_metadata.full_name;
  const name =
    typeof fullName === "string" && fullName.trim() ? fullName : "Tu cuenta";
  return (
    <Shell>
      <Heading>Tu rincón personal</Heading>
      {!ready ? (
        <Loading />
      ) : session ? (
        <Card style={{ maxWidth: 650, width: "100%" }}>
          <View style={[s.row, { flexWrap: "wrap" }]}>
            <Avatar name={name} size={58} />
            <View style={{ gap: 4, flexShrink: 1 }}>
              <Heading size={24}>{name}</Heading>
              <Body muted>{session.user.email || "Cuenta de Google"}</Body>
            </View>
          </View>
          <Chip tone="green">Sesión iniciada con Google</Chip>
          <Body muted>
            Tu sesión se conserva en este navegador o dispositivo. El guardado
            de borradores en Supabase permite consultarlos desde tus
            dispositivos.
          </Body>
          {error && <Notice error>{error}</Notice>}
          <Button onPress={() => router.push("/")}>Ver mis sorteos</Button>
          <Button
            variant="secondary"
            disabled={busy}
            onPress={() => void signOut()}
          >
            {busy ? "Cerrando sesión…" : "Cerrar sesión en este dispositivo"}
          </Button>
        </Card>
      ) : (
        <Card style={{ maxWidth: 650, width: "100%" }}>
          <View style={s.row}>
            <Avatar name="Ana" size={58} />
            <View style={{ gap: 4 }}>
              <Heading size={24}>Ana · cuenta de ejemplo</Heading>
              <Body muted>ana@example.com</Body>
            </View>
          </View>
          <Chip>Vista previa sin sesión real</Chip>
          <Body muted>
            Los borradores y deseos de texto que guardes se conservan en este
            dispositivo. Las fotografías solo duran esta sesión.
          </Body>
          <Button onPress={() => router.push("/acceso")}>
            Ver opciones de inicio de sesión
          </Button>
        </Card>
      )}
      <Card style={{ maxWidth: 650, width: "100%" }}>
        <Heading size={24}>Un extra de ilusión</Heading>
        <Body muted>
          La compra permanente del organizador habilitará las listas de deseos
          en sus sorteos. En este prototipo puedes explorarlas sin pagar.
        </Body>
        <Button
          variant="secondary"
          icon="heart"
          onPress={() => router.push("/premium")}
        >
          Conocer las listas de deseos
        </Button>
      </Card>
      <Notice>
        El borrado de cuenta y la restauración de compras se habilitarán al
        completar esos servicios. Los borradores de tu cuenta se guardan por
        separado de los ejemplos locales. Los correos, el acceso de invitados y
        las listas de deseos reales aún no están disponibles.
      </Notice>
    </Shell>
  );
}

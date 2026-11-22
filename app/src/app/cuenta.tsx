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
  Notice,
  s,
} from "../components/ui";
export default function Account() {
  return (
    <Shell>
      <Heading>Tu rincón personal</Heading>
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
        conectar los servicios reales. Esta vista no crea una cuenta ni procesa
        datos en Supabase.
      </Notice>
    </Shell>
  );
}

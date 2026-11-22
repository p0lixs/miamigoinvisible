import { router } from "expo-router";
import { View } from "react-native";
import { Shell } from "../components/Shell";
import { Body, Button, Card, Heading, s } from "../components/ui";
import { Icon } from "../components/Icon";
import { colors as c } from "../theme";
export default function Help() {
  return (
    <Shell>
      <Heading>Un sorteo, muchas sonrisas</Heading>
      <Body muted>Preparar un amigo invisible puede ser así de sencillo.</Body>
      {[
        {
          title: "Reúne a tu gente",
          text: "Crea un grupo con nombre, descripción y presupuesto orientativo. Añade a cada persona con su correo.",
          icon: "people" as const,
        },
        {
          title: "Cuida las sorpresas",
          text: "Añade excepciones si hay personas que no deben regalarse. Puedes aplicarlas también al revés.",
          icon: "lock" as const,
        },
        {
          title: "Comparte un poco de ilusión",
          text: "Cada persona recibe por correo a quién debe regalar. Solo puede consultar su propio resultado.",
          icon: "gift" as const,
        },
        {
          title: "Da una pista con tus deseos",
          text: "Con la compra permanente del organizador, el grupo puede escribir deseos, compartir enlaces y añadir fotos. Solo los ve su autor y quien deba regalarle.",
          icon: "heart" as const,
        },
      ].map((item) => (
        <Card key={item.title}>
          <View style={s.row}>
            <Icon name={item.icon} color={c.blue} />
            <Heading size={23}>{item.title}</Heading>
          </View>
          <Body muted>{item.text}</Body>
        </Card>
      ))}
      <Button onPress={() => router.push("/nuevo")}>
        Crear mi primer sorteo
      </Button>
    </Shell>
  );
}

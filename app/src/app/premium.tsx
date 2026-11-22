import { useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { Shell } from "../components/Shell";
import { Body, Button, Card, Chip, Heading, Notice, s } from "../components/ui";
import { Icon } from "../components/Icon";
import { colors as c } from "../theme";
import { useStore } from "../data/store";
export default function Premium() {
  const { mode } = useStore();
  const [message, setMessage] = useState("");
  return (
    <Shell>
      <View
        style={{ maxWidth: 680, width: "100%", alignSelf: "center", gap: 24 }}
      >
        <Chip>Un extra para acertar</Chip>
        <Heading size={38}>Menos «¿qué le regalo?». Más ilusión.</Heading>
        <Body muted>
          Activa las listas de deseos para los grupos que organizas con una
          compra permanente para tu cuenta.
        </Body>
        <Card
          style={{
            backgroundColor: c.coralLight,
            borderColor: "#F4D4C7",
            gap: 23,
          }}
        >
          {[
            {
              icon: "heart" as const,
              title: "Un deseo, muchas pistas",
              text: "Cada persona puede añadir texto, enlaces y fotografías.",
            },
            {
              icon: "lock" as const,
              title: "Solo para los ojos adecuados",
              text: "Cada lista es privada: solo la ven su autor y quien deba regalarle.",
            },
            {
              icon: "gift" as const,
              title: "Una compra para tu cuenta",
              text: "Quien organiza paga una vez. Sus participantes usan las listas sin pagar.",
            },
          ].map((item) => (
            <View
              key={item.title}
              style={[s.row, { alignItems: "flex-start" }]}
            >
              <Icon name={item.icon} color={c.ink} />
              <View style={{ flex: 1, gap: 6 }}>
                <Heading size={22}>{item.title}</Heading>
                <Body muted style={{ fontSize: 15 }}>
                  {item.text}
                </Body>
              </View>
            </View>
          ))}
        </Card>
        <Notice>
          Estamos definiendo el precio. Las compras todavía no están disponibles
          en esta vista previa.
        </Notice>
        {mode === "demo" && (
          <Button icon="heart" onPress={() => router.push("/deseos")}>
            Probar mis deseos de ejemplo
          </Button>
        )}
        <Button
          variant="secondary"
          onPress={() =>
            setMessage(
              "La restauración estará disponible al conectar la tienda. No se ha consultado ni modificado ninguna compra.",
            )
          }
        >
          Restaurar compras
        </Button>
        {message && <Notice>{message}</Notice>}
      </View>
    </Shell>
  );
}

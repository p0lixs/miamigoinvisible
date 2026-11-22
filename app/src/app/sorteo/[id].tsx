import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Text, useWindowDimensions, View } from "react-native";
import { Shell } from "../../components/Shell";
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
} from "../../components/ui";
import { Icon } from "../../components/Icon";
import { GiftArt } from "../../components/GiftArt";
import { colors as c, fonts as f } from "../../theme";
import { useStore } from "../../data/store";
import { dateLabel, money, validateDraw } from "../../domain/draw";
export default function DrawScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { draws, ready, copy } = useStore();
  const draw = draws.find((d) => d.id === id);
  const [revealed, setRevealed] = useState(false);
  const [notice, setNotice] = useState("");
  const { width } = useWindowDimensions();
  const wide = width >= 850;
  if (!ready)
    return (
      <Shell>
        <Loading />
      </Shell>
    );
  if (!draw)
    return (
      <Shell>
        <Heading>Sorteo no encontrado</Heading>
        <Body muted>
          Puede que este borrador pertenezca a otro dispositivo.
        </Body>
        <Button onPress={() => router.replace("/")}>
          Volver a mis sorteos
        </Button>
      </Shell>
    );
  const recipient = draw.participants.find(
    (p) => p.id === draw.demoRecipientId,
  );
  const me = draw.participants.find((p) => p.id === draw.currentParticipantId);
  const errors = validateDraw(draw);
  return (
    <Shell>
      <View style={[s.between, { flexWrap: "wrap" }]}>
        <Button small variant="quiet" onPress={() => router.push("/")}>
          Mis sorteos
        </Button>
        <Chip tone={draw.status === "drawn" ? "green" : "orange"}>
          {draw.status === "drawn" ? "Sorteado · ejemplo" : "Borrador local"}
        </Chip>
      </View>
      <View style={[s.between, { alignItems: "flex-start", flexWrap: "wrap" }]}>
        <View style={{ flex: 1, minWidth: 200, gap: 12 }}>
          <Heading size={34}>{draw.title}</Heading>
          <Body muted>
            {draw.description ||
              "Cada detalle cuenta. Prepara una sorpresa para tu gente."}
          </Body>
        </View>
        <Button
          icon="copy"
          variant="secondary"
          onPress={() => router.push(`/sorteo/${copy(draw)}`)}
        >
          Copiar sorteo
        </Button>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
        {[
          {
            icon: "gift" as const,
            label: `${money(draw.budgetCents)} orientativos`,
          },
          { icon: "calendar" as const, label: dateLabel(draw.date) },
          {
            icon: "people" as const,
            label: `${draw.participants.length} personas`,
          },
        ].map((item) => (
          <View
            key={item.icon}
            style={{
              backgroundColor: c.paper,
              borderWidth: 1,
              borderColor: c.line,
              borderRadius: 13,
              paddingHorizontal: 16,
              paddingVertical: 12,
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
            }}
          >
            <Icon name={item.icon} color={c.blue} size={20} />
            <Text style={{ fontFamily: f.medium, color: c.ink, fontSize: 14 }}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
      <View
        style={{
          flexDirection: wide ? "row" : "column",
          gap: 22,
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1, width: wide ? undefined : "100%", gap: 20 }}>
          {draw.status === "drawn" && recipient ? (
            <Card
              style={{
                backgroundColor: "#FFF0C8",
                borderColor: "#F5DE9B",
                alignItems: "center",
                padding: 30,
              }}
            >
              <Chip>Un secreto solo para ti</Chip>
              <GiftArt size={190} variant="coral" />
              {revealed ? (
                <>
                  <Body>¡Te ha tocado regalar a…</Body>
                  <Heading size={42}>{recipient.name}!</Heading>
                  <Body muted style={{ textAlign: "center" }}>
                    Ahora empieza lo bonito: pensar en algo que le haga ilusión.
                  </Body>
                  <Button
                    icon="heart"
                    onPress={() =>
                      router.push({
                        pathname: "/deseos",
                        params: { draw: id, view: "recipient" },
                      })
                    }
                  >
                    Ver sus deseos
                  </Button>
                </>
              ) : (
                <>
                  <Heading size={27}>Tu sorpresa te espera</Heading>
                  <Body muted style={{ textAlign: "center" }}>
                    Este es el resultado de ejemplo de Ana. Solo tú puedes abrir
                    tu sobre.
                  </Body>
                  <Button icon="gift" onPress={() => setRevealed(true)}>
                    Abrir mi sobre
                  </Button>
                </>
              )}
            </Card>
          ) : (
            <Card>
              <Heading size={25}>Dale forma a la sorpresa</Heading>
              <Body muted>
                Revisa los participantes y las excepciones antes de realizar el
                sorteo.
              </Body>
              {errors.length > 0 && <Notice error>{errors.join("\n")}</Notice>}
              <Button
                onPress={() =>
                  router.push({ pathname: "/nuevo", params: { edit: id } })
                }
              >
                Editar borrador
              </Button>
              <Button
                variant="secondary"
                icon="gift"
                onPress={() =>
                  setNotice(
                    errors.length
                      ? errors.join("\n")
                      : "Los campos básicos están completos. Falta comprobar las restricciones y generar el sorteo en el servidor. Todavía no se ha generado ni enviado ningún resultado.",
                  )
                }
              >
                Revisar para sortear
              </Button>
            </Card>
          )}
          {me && (
            <Card
              style={{ backgroundColor: c.mintLight, borderColor: "#D8EBDF" }}
            >
              <View style={s.row}>
                <Icon name="heart" color={c.green} />
                <Heading size={22}>Una pista para acertar</Heading>
              </View>
              <Body muted>
                Escribe tus deseos y ayuda a quien tenga que regalarte. Puedes
                cambiarlos cuando quieras.
              </Body>
              <Button
                variant="secondary"
                onPress={() =>
                  router.push({ pathname: "/deseos", params: { draw: id } })
                }
              >
                Mi lista de deseos
              </Button>
            </Card>
          )}
        </View>
        <Card style={{ width: wide ? 320 : "100%" }}>
          <Heading size={22}>El grupo</Heading>
          {draw.participants.length === 0 ? (
            <Body muted>Añade a las personas que participan.</Body>
          ) : (
            draw.participants.map((person, index) => (
              <View style={s.row} key={person.id}>
                <Avatar name={person.name} index={index} />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontFamily: f.bold, color: c.ink, fontSize: 15 }}
                  >
                    {person.name}
                    {person.id === me?.id ? " (tú)" : ""}
                  </Text>
                  <Text
                    style={{ fontFamily: f.body, color: c.muted, fontSize: 13 }}
                  >
                    {person.email}
                  </Text>
                </View>
              </View>
            ))
          )}
          <View
            style={{
              paddingTop: 16,
              borderTopWidth: 1,
              borderColor: c.line,
              gap: 10,
            }}
          >
            <View style={s.row}>
              <Icon name="lock" color={c.blue} size={18} />
              <Body muted style={{ fontSize: 13 }}>
                Los emparejamientos son privados.
              </Body>
            </View>
            <Body muted style={{ fontSize: 13 }}>
              Vista del organizador de ejemplo. La comprobación de identidad
              real todavía no está conectada.
            </Body>
          </View>
        </Card>
      </View>
      {notice && <Notice>{notice}</Notice>}
      <Notice>
        Los cambios de esta vista previa se guardan solo en este dispositivo.
        Copiar crea un borrador nuevo y no envía invitaciones ni reutiliza
        resultados.
      </Notice>
    </Shell>
  );
}

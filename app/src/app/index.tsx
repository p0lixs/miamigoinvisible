import { useState } from "react";
import { router } from "expo-router";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import { Shell } from "../components/Shell";
import {
  Avatar,
  Body,
  Button,
  Card,
  Chip,
  Heading,
  Loading,
  s,
} from "../components/ui";
import { GiftArt } from "../components/GiftArt";
import { Icon } from "../components/Icon";
import { colors as c, fonts as f } from "../theme";
import { useStore } from "../data/store";
import { dateLabel, money } from "../domain/draw";
export default function Home() {
  const { draws, ready, mode, reload } = useStore();
  const { width } = useWindowDimensions();
  const wide = width >= 760;
  const [filter, setFilter] = useState("Todos");
  return (
    <Shell>
      {!ready ? (
        <Loading />
      ) : (
        <>
          <View style={[s.between, { flexWrap: "wrap" }]}>
            <View style={{ gap: 7 }}>
              <Text
                style={{ fontFamily: f.medium, color: c.muted, fontSize: 14 }}
              >
                TU RINCÓN DE LAS SORPRESAS
              </Text>
              <Heading size={wide ? 34 : 29}>Regalar sienta bien.</Heading>
            </View>
            <Button
              icon="mail"
              variant="secondary"
              onPress={() => router.push("/entrar")}
            >
              Entrar con código
            </Button>
          </View>
          <View
            style={{
              backgroundColor: c.blue,
              borderRadius: 27,
              padding: wide ? 34 : 25,
              flexDirection: wide ? "row" : "column",
              overflow: "hidden",
              minHeight: wide ? 260 : undefined,
            }}
          >
            <View
              style={{
                flex: 1,
                gap: 14,
                justifyContent: "center",
                alignItems: "flex-start",
                zIndex: 1,
              }}
            >
              <View
                style={{
                  backgroundColor: "#FFF2CE",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{ fontFamily: f.bold, fontSize: 12, color: "#70531A" }}
                >
                  CUALQUIER DÍA ES BUENO PARA REGALAR
                </Text>
              </View>
              <Text
                accessibilityRole="header"
                style={{
                  fontFamily: f.display,
                  fontSize: wide ? 44 : 35,
                  lineHeight: wide ? 49 : 40,
                  color: "white",
                }}
              >
                La ilusión empieza{wide ? "\n" : " "}con un nombre.
              </Text>
              <Text
                style={{
                  fontFamily: f.body,
                  fontSize: 16,
                  lineHeight: 25,
                  color: "#E9F0FF",
                  maxWidth: 400,
                }}
              >
                Junta a tu gente, prepara las sorpresas y deja que el azar haga
                su magia.
              </Text>
              <Button
                variant="coral"
                icon="plus"
                onPress={() => router.push("/nuevo")}
                style={{ marginTop: 5 }}
              >
                Crear mi sorteo
              </Button>
            </View>
            <View
              style={{
                width: wide ? 290 : "100%",
                alignItems: "flex-end",
                justifyContent: "center",
                marginTop: wide ? 0 : -18,
                marginBottom: wide ? 0 : -20,
              }}
            >
              <GiftArt size={wide ? 290 : 190} />
            </View>
          </View>
          <View style={[s.between, { flexWrap: "wrap" }]}>
            <View style={s.row}>
              <Heading size={24}>Mis sorteos</Heading>
              <View
                style={{
                  backgroundColor: "#ECE8E1",
                  width: 27,
                  height: 27,
                  borderRadius: 14,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontFamily: f.bold, color: c.ink, fontSize: 13 }}
                >
                  {draws.length}
                </Text>
              </View>
            </View>
            {mode === "account" && (
              <Button small variant="quiet" onPress={() => void reload()}>
                Actualizar mis sorteos
              </Button>
            )}
            <View
              style={{
                flexDirection: "row",
                gap: 4,
                backgroundColor: "#EFEDE7",
                padding: 4,
                borderRadius: 12,
              }}
            >
              {["Todos", "Borradores", "Sorteados"].map((label) => (
                <Pressable
                  key={label}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: filter === label }}
                  onPress={() => setFilter(label)}
                  style={{
                    minHeight: 44,
                    justifyContent: "center",
                    paddingHorizontal: 13,
                    paddingVertical: 10,
                    borderRadius: 9,
                    backgroundColor: filter === label ? c.paper : "transparent",
                  }}
                >
                  <Text
                    style={{
                      fontFamily: filter === label ? f.bold : f.medium,
                      fontSize: 13,
                      color: filter === label ? c.ink : c.muted,
                    }}
                  >
                    {label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
            {draws
              .filter(
                (draw) =>
                  filter === "Todos" ||
                  (filter === "Borradores"
                    ? draw.status === "draft"
                    : draw.status === "drawn"),
              )
              .map((draw) => (
                <Card
                  key={draw.id}
                  style={{
                    flexGrow: 1,
                    flexBasis: wide ? "45%" : "100%",
                    minWidth: 0,
                    maxWidth: wide
                      ? (Math.min(width - (width >= 1000 ? 320 : 40), 1150) -
                          20) /
                        2
                      : undefined,
                    padding: 0,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      height: 104,
                      backgroundColor:
                        draw.color === "coral"
                          ? c.coralLight
                          : draw.color === "mint"
                            ? c.mintLight
                            : c.blueLight,
                      flexDirection: "row",
                      paddingHorizontal: 24,
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: c.paper,
                        padding: 12,
                        borderRadius: 18,
                      }}
                    >
                      <Icon
                        name="gift"
                        size={29}
                        color={draw.color === "coral" ? "#B6553A" : c.blue}
                      />
                    </View>
                    <View style={{ marginTop: 10, marginRight: -2 }}>
                      <GiftArt size={125} variant={draw.color} />
                    </View>
                  </View>
                  <View style={{ padding: 24, gap: 15 }}>
                    <View style={s.between}>
                      <Chip tone={draw.status === "drawn" ? "green" : "orange"}>
                        {draw.status === "drawn" ? "Sorteado" : "Borrador"}
                      </Chip>
                      <View style={s.row}>
                        <Icon name="calendar" color={c.muted} size={16} />
                        <Text
                          style={{
                            fontFamily: f.medium,
                            color: c.muted,
                            fontSize: 13,
                          }}
                        >
                          {dateLabel(draw.date)}
                        </Text>
                      </View>
                    </View>
                    <Heading size={24}>
                      {draw.title || "Sorteo sin título"}
                    </Heading>
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 18,
                        flexWrap: "wrap",
                      }}
                    >
                      <View style={s.row}>
                        <Icon name="people" size={18} color={c.muted} />
                        <Body muted style={{ fontSize: 14 }}>
                          {draw.participants.length} personas
                        </Body>
                      </View>
                      <View style={s.row}>
                        <Icon name="gift" size={18} color={c.muted} />
                        <Body muted style={{ fontSize: 14 }}>
                          {money(draw.budgetCents)} orientativos
                        </Body>
                      </View>
                    </View>
                    <View
                      style={[
                        s.between,
                        {
                          paddingTop: 14,
                          borderTopWidth: 1,
                          borderColor: c.line,
                        },
                      ]}
                    >
                      <View style={{ flexDirection: "row" }}>
                        {draw.participants.slice(0, 4).map((p, i) => (
                          <View key={p.id} style={{ marginLeft: i ? -8 : 0 }}>
                            <Avatar name={p.name} index={i} size={31} />
                          </View>
                        ))}
                        {draw.participants.length > 4 && (
                          <Avatar
                            name={`+${draw.participants.length - 4}`}
                            size={31}
                          />
                        )}
                      </View>
                      <Button
                        small
                        variant={
                          draw.status === "drawn" ? "primary" : "secondary"
                        }
                        onPress={() => router.push(`/sorteo/${draw.id}`)}
                      >
                        {draw.status === "drawn" ? "Abrir sorteo" : "Continuar"}
                      </Button>
                    </View>
                  </View>
                </Card>
              ))}
          </View>
          {draws.filter(
            (draw) =>
              filter === "Todos" ||
              (filter === "Borradores"
                ? draw.status === "draft"
                : draw.status === "drawn"),
          ).length === 0 && (
            <Card>
              <Heading size={22}>Aquí empieza la próxima sorpresa</Heading>
              <Body muted>Todavía no tienes sorteos en esta categoría.</Body>
              <Button onPress={() => router.push("/nuevo")} icon="plus">
                Crear un sorteo
              </Button>
            </Card>
          )}
          <View
            style={{
              backgroundColor: c.mintLight,
              borderRadius: 19,
              padding: 22,
              flexDirection: "row",
              gap: 15,
              alignItems: "center",
            }}
          >
            <View
              style={{ backgroundColor: c.mint, padding: 11, borderRadius: 15 }}
            >
              <Icon name="lock" color={c.green} size={24} />
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={{ fontFamily: f.bold, fontSize: 15, color: c.ink }}>
                Cada sorpresa tiene su secreto
              </Text>
              <Text
                style={{
                  fontFamily: f.body,
                  fontSize: 14,
                  lineHeight: 21,
                  color: c.muted,
                }}
              >
                Cada persona ve solo a quién regala. Incluso quien organiza.
              </Text>
            </View>
          </View>
        </>
      )}
    </Shell>
  );
}

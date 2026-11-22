import { router, usePathname } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors as c, fonts as f } from "../theme";
import { Icon, type IconName } from "./Icon";
import { Avatar, Button, Notice } from "./ui";
import { useStore } from "../data/store";
import type { ReactNode } from "react";
import { useAuth } from "../auth/session";
const links: { label: string; path: string; icon: IconName }[] = [
  { label: "Mis sorteos", path: "/", icon: "gift" },
  { label: "Mis deseos", path: "/deseos", icon: "heart" },
  { label: "Cómo funciona", path: "/ayuda", icon: "help" },
];
function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Pressable
      accessibilityLabel="Mi amigo invisible, inicio"
      accessibilityRole="link"
      onPress={() => router.push("/")}
      style={{ flexDirection: "row", gap: 10, alignItems: "center" }}
    >
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 13,
          backgroundColor: c.blue,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Icon name="gift" color="white" size={26} />
      </View>
      <Text
        style={{
          fontFamily: f.display,
          fontSize: compact ? 19 : 23,
          lineHeight: compact ? 22 : 26,
          color: c.ink,
        }}
      >
        Mi amigo{compact ? " " : "\n"}invisible
        <Text style={{ color: c.coral }}>.</Text>
      </Text>
    </Pressable>
  );
}
export function Shell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();
  const desktop = width >= 1000;
  const path = usePathname();
  const insets = useSafeAreaInsets();
  const { storageError, loadError, mode, ready, reload } = useStore();
  const dataView =
    path === "/" ||
    path === "/nuevo" ||
    path === "/deseos" ||
    path.startsWith("/sorteo/");
  const { session } = useAuth();
  const accountName = session ? "Mi cuenta" : "Ana · demo";
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.bg,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <View
        style={{
          backgroundColor: "#E8EEF9",
          paddingHorizontal: 16,
          paddingVertical: 7,
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: f.medium,
            color: "#425573",
            fontSize: 12,
            textAlign: "center",
          }}
        >
          {mode === "demo"
            ? "DEMO · Sorteos y deseos locales de ejemplo · Sin envíos ni cobros"
            : "TU CUENTA · Sorteos privados · Correos aún no disponibles"}
        </Text>
      </View>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {desktop && (
          <View style={styles.sidebar}>
            <Brand />
            <View style={{ gap: 8, marginTop: 44 }}>
              {links.map((link) => (
                <Nav key={link.path} {...link} active={path === link.path} />
              ))}
            </View>
            <View style={{ flex: 1 }} />
            <View
              style={{
                backgroundColor: c.coralLight,
                padding: 18,
                borderRadius: 18,
                gap: 9,
              }}
            >
              <Icon name="sparkle" color="#A05035" />
              <Text style={{ fontFamily: f.bold, fontSize: 15, color: c.ink }}>
                Un poquito de ilusión
              </Text>
              <Text
                style={{
                  fontFamily: f.body,
                  fontSize: 14,
                  lineHeight: 21,
                  color: c.muted,
                }}
              >
                Los mejores regalos empiezan por conocer a alguien.
              </Text>
            </View>
            <Nav
              label="Mi cuenta"
              icon="settings"
              path="/cuenta"
              active={path === "/cuenta"}
            />
            <Text
              style={{
                fontFamily: f.body,
                fontSize: 12,
                color: c.muted,
                marginTop: 4,
              }}
            >
              Hecho para regalar sonrisas.
            </Text>
          </View>
        )}
        <View style={{ flex: 1, minWidth: 0 }}>
          <View
            style={[styles.topbar, { paddingHorizontal: desktop ? 40 : 20 }]}
          >
            {desktop ? (
              <Text
                style={{ fontFamily: f.medium, fontSize: 14, color: c.muted }}
              >
                Pequeños detalles. Grandes sonrisas.
              </Text>
            ) : (
              <Brand compact />
            )}
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={
                session ? "Abrir mi cuenta" : "Abrir cuenta de ejemplo de Ana"
              }
              onPress={() => router.push("/cuenta")}
              style={{ flexDirection: "row", gap: 9, alignItems: "center" }}
            >
              {width > 600 && (
                <Text
                  style={{ fontFamily: f.bold, fontSize: 14, color: c.ink }}
                >
                  {accountName}
                </Text>
              )}
              <Avatar name={session ? "Mi cuenta" : "Ana"} size={37} />
            </Pressable>
          </View>
          <ScrollView
            key={path}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              padding: desktop ? 40 : 20,
              paddingTop: desktop ? 30 : 24,
              paddingBottom: 40,
              flexGrow: 1,
            }}
          >
            <View
              style={{
                width: "100%",
                maxWidth: 1150,
                alignSelf: "center",
                gap: 25,
              }}
            >
              {storageError && (mode === "demo" || dataView) && (
                <Notice error>{storageError}</Notice>
              )}
              {loadError && dataView ? (
                <Button disabled={!ready} onPress={() => void reload()}>
                  Volver a cargar mis sorteos
                </Button>
              ) : (
                children
              )}
            </View>
          </ScrollView>
        </View>
      </View>
      {!desktop && (
        <View style={styles.bottom}>
          {[
            ...links.slice(0, 2),
            { label: "Mi cuenta", path: "/cuenta", icon: "settings" as const },
          ].map((link) => (
            <Nav
              key={link.path}
              {...link}
              active={path === link.path}
              compact
            />
          ))}
        </View>
      )}
    </View>
  );
}
function Nav({
  label,
  path,
  icon,
  active,
  compact = false,
}: {
  label: string;
  path: string;
  icon: IconName;
  active: boolean;
  compact?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityState={{ selected: active }}
      onPress={() => router.push(path as never)}
      style={({ pressed }) => ({
        flex: compact ? 1 : undefined,
        flexDirection: compact ? "column" : "row",
        alignItems: "center",
        gap: compact ? 5 : 12,
        paddingHorizontal: compact ? 4 : 15,
        paddingVertical: compact ? 10 : 14,
        minHeight: 48,
        borderRadius: 13,
        backgroundColor: active
          ? c.blueLight
          : pressed
            ? c.mintLight
            : "transparent",
      })}
    >
      <Icon name={icon} color={active ? c.blue : c.muted} size={22} />
      <Text
        style={{
          fontFamily: active ? f.bold : f.medium,
          fontSize: compact ? 12 : 15,
          color: active ? c.blue : c.muted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  sidebar: {
    width: 240,
    padding: 25,
    paddingTop: 33,
    backgroundColor: c.paper,
    borderRightWidth: 1,
    borderColor: c.line,
    gap: 22,
  },
  topbar: {
    minHeight: 83,
    backgroundColor: c.bg,
    borderBottomWidth: 1,
    borderColor: "#EDE8E0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  bottom: {
    flexDirection: "row",
    backgroundColor: c.paper,
    borderTopWidth: 1,
    borderColor: c.line,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
});

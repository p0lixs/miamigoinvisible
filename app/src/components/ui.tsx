import { useState, type ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";
import { colors as c, fonts as f } from "../theme";
import { Icon, type IconName } from "./Icon";

export function Button({
  children,
  onPress,
  variant = "primary",
  icon,
  disabled,
  style,
  small = false,
}: {
  children: string;
  onPress?: () => void;
  variant?: "primary" | "secondary" | "quiet" | "coral";
  icon?: IconName;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  small?: boolean;
}) {
  const [hover, setHover] = useState(false);
  const ink = variant === "primary" ? "#FFFFFF" : c.ink;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      style={({ pressed }) => [
        s.button,
        {
          backgroundColor:
            variant === "primary"
              ? hover
                ? c.blueDark
                : c.blue
              : variant === "coral"
                ? c.coral
                : variant === "secondary"
                  ? c.paper
                  : "transparent",
          borderColor: variant === "secondary" ? c.line : "transparent",
          minHeight: small ? 48 : 50,
          opacity: disabled ? 0.48 : pressed ? 0.8 : 1,
          transform: [{ translateY: pressed ? 1 : 0 }],
        },
        style,
      ]}
    >
      {icon && <Icon name={icon} size={20} color={ink} />}
      <Text
        style={{
          fontFamily: f.bold,
          fontSize: 15,
          color: ink,
          textAlign: "center",
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
export function Label({ children }: { children: ReactNode }) {
  return <Text style={s.label}>{children}</Text>;
}
export function Body({
  children,
  muted = false,
  style,
}: {
  children: ReactNode;
  muted?: boolean;
  style?: StyleProp<import("react-native").TextStyle>;
}) {
  return (
    <Text style={[s.body, { color: muted ? c.muted : c.ink }, style]}>
      {children}
    </Text>
  );
}
export function Heading({
  children,
  size = 32,
}: {
  children: ReactNode;
  size?: number;
}) {
  return (
    <Text
      accessibilityRole="header"
      style={{
        fontFamily: f.display,
        fontSize: size,
        lineHeight: size * 1.15,
        color: c.ink,
      }}
    >
      {children}
    </Text>
  );
}
export function Field({
  label,
  hint,
  error,
  ...props
}: TextInputProps & { label: string; hint?: string; error?: string }) {
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 7, flexShrink: 1 }}>
      <Label>{label}</Label>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#7B8795"
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        {...props}
        style={[
          s.input,
          props.multiline && { minHeight: 110, textAlignVertical: "top" },
          { borderColor: error ? c.error : focus ? c.blue : c.line },
          props.style,
        ]}
      />
      {error && (
        <Text accessibilityRole="alert" style={s.error}>
          {error}
        </Text>
      )}
      {hint && <Text style={s.hint}>{hint}</Text>}
    </View>
  );
}
export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[s.card, style]}>{children}</View>;
}
export function Chip({
  children,
  tone = "blue",
}: {
  children: string;
  tone?: "blue" | "green" | "orange";
}) {
  return (
    <View
      style={{
        alignSelf: "flex-start",
        paddingVertical: 5,
        paddingHorizontal: 11,
        borderRadius: 20,
        backgroundColor:
          tone === "green"
            ? c.mintLight
            : tone === "orange"
              ? c.coralLight
              : c.blueLight,
      }}
    >
      <Text
        style={{
          fontFamily: f.bold,
          fontSize: 13,
          color:
            tone === "green" ? c.green : tone === "orange" ? "#984B2F" : c.blue,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
export function Notice({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <View
      accessibilityRole={error ? "alert" : undefined}
      style={{
        borderRadius: 14,
        padding: 16,
        backgroundColor: error ? "#FFF0EF" : c.blueLight,
        flexDirection: "row",
        gap: 10,
        alignItems: "flex-start",
      }}
    >
      <Icon
        name={error ? "help" : "lock"}
        size={19}
        color={error ? c.error : c.blue}
      />
      <Body
        style={{
          flex: 1,
          color: error ? c.error : c.ink,
          fontSize: 14,
          lineHeight: 21,
        }}
      >
        {children}
      </Body>
    </View>
  );
}
export function Avatar({
  name,
  index = 0,
  size = 36,
}: {
  name: string;
  index?: number;
  size?: number;
}) {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: [c.mint, c.yellow, "#FFD6C9", c.blueLight][index % 4],
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: c.paper,
      }}
    >
      <Text style={{ fontFamily: f.bold, color: c.ink, fontSize: size * 0.36 }}>
        {name.slice(0, 2).toUpperCase()}
      </Text>
    </View>
  );
}
export function IconButton({
  name,
  onPress,
  label,
}: {
  name: IconName;
  onPress: () => void;
  label: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 12,
        backgroundColor: pressed ? c.blueLight : "transparent",
      })}
    >
      <Icon name={name} color={c.muted} size={20} />
    </Pressable>
  );
}
export function Loading() {
  return (
    <View
      style={{
        flex: 1,
        minHeight: 240,
        alignItems: "center",
        justifyContent: "center",
        gap: 15,
      }}
    >
      <ActivityIndicator color={c.blue} />
      <Body muted>Preparando las sorpresas…</Body>
    </View>
  );
}
export const s = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingHorizontal: 19,
    paddingVertical: 11,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  body: { fontFamily: f.body, fontSize: 16, lineHeight: 25, color: c.ink },
  label: { fontFamily: f.bold, fontSize: 14, color: c.ink },
  input: {
    borderWidth: 1.5,
    borderColor: c.line,
    borderRadius: 13,
    backgroundColor: c.paper,
    minHeight: 50,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontFamily: f.body,
    fontSize: 16,
    color: c.ink,
  },
  error: { fontFamily: f.medium, fontSize: 14, color: c.error },
  hint: { fontFamily: f.body, fontSize: 13, lineHeight: 20, color: c.muted },
  card: {
    backgroundColor: c.paper,
    borderWidth: 1,
    borderColor: c.line,
    borderRadius: 22,
    padding: 24,
    gap: 18,
  },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  between: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
});

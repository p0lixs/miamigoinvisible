import { useState } from "react";
import { router } from "expo-router";
import { View } from "react-native";
import { Shell } from "../components/Shell";
import { Body, Button, Card, Field, Heading, Notice } from "../components/ui";
import { GiftArt } from "../components/GiftArt";
import { validEmail } from "../domain/draw";
export default function Join() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  function submit() {
    if (!code.trim() || !validEmail(email)) {
      setError("Indica el código del sorteo y un correo válido.");
      setNotice("");
      return;
    }
    setError("");
    setNotice(
      "La verificación por correo todavía no está conectada en esta vista previa. No se ha enviado ningún mensaje. Puedes explorar la invitación de ejemplo.",
    );
  }
  return (
    <Shell>
      <View
        style={{ maxWidth: 540, width: "100%", alignSelf: "center", gap: 22 }}
      >
        <View style={{ alignItems: "center" }}>
          <GiftArt size={200} variant="mint" />
        </View>
        <Heading size={33}>Tu grupo te está esperando.</Heading>
        <Body muted>
          Introduce el código que te han compartido y el correo con el que te
          añadieron al sorteo.
        </Body>
        <Card>
          <Field
            label="Código del sorteo"
            placeholder="Código de tu invitación"
            value={code}
            onChangeText={setCode}
            autoCapitalize="characters"
            maxLength={20}
          />
          <Field
            label="Tu correo electrónico"
            placeholder="tu-correo@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            maxLength={254}
          />
          {error && <Notice error>{error}</Notice>}
          <Button icon="mail" onPress={submit}>
            Verificar mi correo
          </Button>
          <Body muted style={{ fontSize: 13 }}>
            El código no permite ver resultados por sí solo. Primero hay que
            verificar tu correo.
          </Body>
        </Card>
        {notice && <Notice>{notice}</Notice>}
        <Button
          variant="secondary"
          onPress={() => router.push("/sorteo/pandilla")}
        >
          Explorar invitación de ejemplo
        </Button>
      </View>
    </Shell>
  );
}

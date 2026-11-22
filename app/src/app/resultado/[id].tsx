import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { View } from "react-native";
import { Shell } from "../../components/Shell";
import { Body, Button, Card, Chip, Heading, Notice } from "../../components/ui";
import { GiftArt } from "../../components/GiftArt";
import { useAuth } from "../../auth/session";
import { supabase } from "../../auth/supabase";
import { loadOwnResult } from "../../data/result-repository";
import { DraftError } from "../../domain/draft";
import { dateLabel, money } from "../../domain/draw";
import type { OwnResult } from "../../domain/result";

export default function OwnResultPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { session } = useAuth();
  if (!session)
    return (
      <Shell>
        <Heading>Tu sorpresa es solo para ti</Heading>
        <Body muted>
          Entra con la cuenta de Google cuyo correo figura en el grupo y vuelve
          a abrir este enlace. El acceso para invitados por correo estará
          disponible más adelante.
        </Body>
        <Button onPress={() => router.push("/acceso")}>
          Entrar con Google
        </Button>
      </Shell>
    );
  return (
    <ResultReader
      key={`${session.user.id}:${id}`}
      id={id}
      accountId={session.user.id}
    />
  );
}

function ResultReader({ id, accountId }: { id: string; accountId: string }) {
  const [result, setResult] = useState<OwnResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const active = useRef(false);
  const pending = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  async function reveal() {
    if (!supabase || pending.current) return;
    pending.current = true;
    setBusy(true);
    setError("");
    try {
      const own = await loadOwnResult(supabase, id, accountId);
      if (active.current) setResult(own);
    } catch (cause) {
      if (active.current)
        setError(
          cause instanceof DraftError
            ? cause.message
            : "No se ha podido abrir tu resultado.",
        );
    } finally {
      pending.current = false;
      if (active.current) setBusy(false);
    }
  }
  return (
    <Shell>
      <View
        style={{ maxWidth: 580, width: "100%", alignSelf: "center", gap: 22 }}
      >
        <Card
          style={{
            alignItems: "center",
            backgroundColor: "#FFF0C8",
            borderColor: "#F5DE9B",
            padding: 28,
          }}
        >
          <Chip>Un secreto solo para ti</Chip>
          <GiftArt size={190} variant="coral" />
          {result?.available ? (
            <>
              <Body>Te ha tocado regalar a…</Body>
              <Heading size={36}>{result.recipientName}</Heading>
              <Heading size={23}>{result.title}</Heading>
              {result.description && <Body muted>{result.description}</Body>}
              <Body muted>
                {money(result.budgetCents)} orientativos ·{" "}
                {dateLabel(result.date)}
              </Body>
              <Button variant="secondary" onPress={() => setResult(null)}>
                Ocultar mi resultado
              </Button>
            </>
          ) : (
            <>
              <Heading size={28}>Tu sorpresa te espera</Heading>
              <Body muted>
                Al abrir el sobre consultarás únicamente tu destinatario.
                Organizar el sorteo no permite abrir los sobres de otras
                personas.
              </Body>
              {result?.available === false && (
                <Notice>
                  No hay un resultado disponible para esta cuenta. Comprueba que
                  usas el correo añadido al grupo y que el sorteo ya se ha
                  realizado.
                </Notice>
              )}
              <Button icon="gift" disabled={busy} onPress={() => void reveal()}>
                {busy ? "Abriendo tu sobre…" : "Abrir mi sobre"}
              </Button>
            </>
          )}
          {error && <Notice error>{error}</Notice>}
        </Card>
        <Button variant="quiet" onPress={() => router.push("/")}>
          Ir al inicio
        </Button>
      </View>
    </Shell>
  );
}

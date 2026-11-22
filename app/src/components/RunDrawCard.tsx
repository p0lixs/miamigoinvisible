import { useEffect, useRef, useState } from "react";
import { router } from "expo-router";
import { Body, Button, Card, Heading, Notice } from "./ui";
import { useStore } from "../data/store";
import { money, validateDraw, type Draw } from "../domain/draw";
import { DraftError } from "../domain/draft";

export function RunDrawCard({ draw }: { draw: Draw }) {
  const { generate, saving } = useStore();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const active = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const errors = validateDraw(draw);
  async function run() {
    if (saving) return;
    setError("");
    try {
      await generate(draw);
    } catch (cause) {
      if (active.current)
        setError(
          cause instanceof DraftError
            ? cause.message
            : "No se ha podido confirmar el sorteo. Actualiza tus sorteos antes de volver a intentarlo.",
        );
    }
  }
  return (
    <Card>
      <Heading size={25}>
        {confirming ? "Todo listo para sortear" : "Dale forma a la sorpresa"}
      </Heading>
      <Body muted>
        {confirming
          ? `${draw.participants.length} personas · ${money(draw.budgetCents)} orientativos · ${draw.exclusions.length} excepciones.`
          : "Revisa los participantes y las excepciones antes de realizar el sorteo."}
      </Body>
      {errors.length > 0 && <Notice error>{errors.join("\n")}</Notice>}
      {confirming ? (
        <>
          <Notice>
            Se guardará una única combinación. Después no podrás editar los
            participantes ni las excepciones. Para repetirlo, crea una copia
            independiente.
          </Notice>
          <Notice>
            Todavía no se enviarán correos. En esta etapa el resultado propio se
            consulta con una cuenta de Google cuyo correo figure en el grupo. El
            acceso de invitados por correo llegará más adelante.
          </Notice>
          <Button
            icon="gift"
            disabled={saving || errors.length > 0}
            onPress={() => void run()}
          >
            {saving ? "Realizando el sorteo…" : "Confirmar y realizar sorteo"}
          </Button>
          <Button
            variant="quiet"
            disabled={saving}
            onPress={() => setConfirming(false)}
          >
            Seguir revisando
          </Button>
        </>
      ) : (
        <>
          <Button
            disabled={saving}
            onPress={() =>
              router.push({ pathname: "/nuevo", params: { edit: draw.id } })
            }
          >
            Editar borrador
          </Button>
          <Button
            variant="secondary"
            icon="gift"
            disabled={saving || errors.length > 0}
            onPress={() => {
              setError("");
              setConfirming(true);
            }}
          >
            Preparar el sorteo
          </Button>
        </>
      )}
      {error && <Notice error>{error}</Notice>}
    </Card>
  );
}

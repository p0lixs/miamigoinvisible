import { useEffect, useRef, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { randomUUID } from "expo-crypto";
import {
  Pressable,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { Shell } from "../components/Shell";
import {
  Avatar,
  Body,
  Button,
  Card,
  Chip,
  Field,
  Heading,
  IconButton,
  Label,
  Loading,
  Notice,
  s,
} from "../components/ui";
import { Icon } from "../components/Icon";
import { colors as c, fonts as f } from "../theme";
import { useStore } from "../data/store";
import { DraftError } from "../domain/draft";
import {
  money,
  parseBudget,
  validDate,
  validEmail,
  validateDraw,
  type Draw,
  type Participant,
} from "../domain/draw";

const steps = ["El plan", "Tu gente", "Excepciones", "Todo listo"];
export default function NewDraw() {
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { draws, ready } = useStore();
  const [fresh] = useState<Draw>(() => ({
    id: randomUUID(),
    title: "",
    description: "",
    budgetCents: null,
    date: "",
    status: "draft",
    participants: [],
    exclusions: [],
    wishlists: {},
    color: "blue",
  }));
  if (!ready)
    return (
      <Shell>
        <Loading />
      </Shell>
    );
  const initial = edit ? draws.find((d) => d.id === edit) : fresh;
  if (!initial || initial.status !== "draft")
    return (
      <Shell>
        <Heading>Este sorteo no se puede editar</Heading>
        <Body muted>
          Un sorteo realizado conserva sus participantes y excepciones. Puedes
          copiarlo para preparar otro.
        </Body>
        <Button onPress={() => router.replace("/")}>
          Volver a mis sorteos
        </Button>
      </Shell>
    );
  return <Wizard key={initial.id} initial={initial} />;
}

function Wizard({ initial }: { initial: Draw }) {
  const { save, saving, mode, identity } = useStore();
  const active = useRef(false);
  useEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
    };
  }, []);
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(0);
  const [draw, setDraw] = useState<Draw>(initial);
  const [budget, setBudget] = useState(
    initial.budgetCents === null
      ? ""
      : String(initial.budgetCents / 100).replace(".", ","),
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [giver, setGiver] = useState("");
  const [recipient, setRecipient] = useState("");
  const [mutual, setMutual] = useState(false);
  const patch = (next: Partial<Draw>) => {
    if (!saving) setDraw((previous) => ({ ...previous, ...next }));
  };
  const current = () => ({ ...draw, budgetCents: parseBudget(budget) });
  async function saveDraft() {
    if (saving) return;
    setSaveError("");
    if (name.trim() || email.trim()) {
      setErrors({
        people:
          "Añade la persona que estás escribiendo, o borra esos campos, antes de guardar.",
      });
      setStep(1);
      return;
    }
    if (
      (budget.trim() && parseBudget(budget) === null) ||
      !validDate(draw.date)
    ) {
      setErrors({
        ...(budget.trim() && parseBudget(budget) === null
          ? { budget: "Revisa el presupuesto antes de guardar." }
          : {}),
        ...(!validDate(draw.date)
          ? { date: "Revisa la fecha antes de guardar." }
          : {}),
      });
      setStep(0);
      return;
    }
    setMessage("");
    try {
      const saved = await save(current());
      if (active.current) router.replace(`/sorteo/${saved.id}`);
    } catch (error) {
      if (active.current)
        setSaveError(
          error instanceof DraftError
            ? error.message
            : "No se ha podido guardar. Tus cambios siguen en este formulario.",
        );
    }
  }
  function advance() {
    if (saving) return;
    const nextErrors: Record<string, string> = {};
    if (step === 0) {
      if (!draw.title.trim())
        nextErrors.title = "Ponle un nombre a esta sorpresa.";
      if (parseBudget(budget) === null)
        nextErrors.budget =
          "Indica un importe mayor que cero, con hasta dos decimales.";
      if (!validDate(draw.date))
        nextErrors.date = "Usa una fecha real en formato AAAA-MM-DD.";
    }
    if (step === 1) {
      if (name.trim() || email.trim())
        nextErrors.people =
          "Añade la persona que estás escribiendo antes de continuar.";
      else if (draw.participants.length < 3)
        nextErrors.people = "Necesitas al menos 3 personas para este sorteo.";
    }
    setErrors(nextErrors);
    setMessage("");
    if (Object.keys(nextErrors).length) return;
    if (step === 3) {
      const issues = validateDraw(current());
      if (issues.length) {
        setMessage(issues.join("\n"));
        return;
      }
      void saveDraft();
      return;
    }
    setStep(step + 1);
  }
  function addPerson() {
    const nextErrors: Record<string, string> = {};
    if (!name.trim()) nextErrors.name = "Escribe su nombre.";
    if (!validEmail(email)) nextErrors.email = "Escribe un correo válido.";
    if (
      draw.participants.some(
        (p) => p.email.trim().toLowerCase() === email.trim().toLowerCase(),
      )
    )
      nextErrors.email = "Ese correo ya está en el grupo.";
    if (draw.participants.length >= 100)
      nextErrors.people =
        "Has llegado al límite de 100 personas de esta versión.";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    patch({
      participants: [
        ...draw.participants,
        { id: randomUUID(), name: name.trim(), email: email.trim() },
      ],
    });
    setName("");
    setEmail("");
  }
  function removePerson(id: string) {
    patch({
      participants: draw.participants.filter((p) => p.id !== id),
      exclusions: draw.exclusions.filter(
        (rule) => rule.giverId !== id && rule.recipientId !== id,
      ),
      currentParticipantId:
        draw.currentParticipantId === id
          ? undefined
          : draw.currentParticipantId,
    });
    if (giver === id) setGiver("");
    if (recipient === id) setRecipient("");
  }
  function toggleMe(enabled: boolean) {
    if (!enabled && draw.currentParticipantId) {
      removePerson(draw.currentParticipantId);
      return;
    }
    if (enabled) {
      const existing = draw.participants.find(
        (p) => p.email.toLowerCase() === identity.email.toLowerCase(),
      );
      if (existing) {
        patch({ currentParticipantId: existing.id });
        return;
      }
      if (draw.participants.length >= 100) {
        setErrors({ people: "Has llegado al límite de participantes." });
        return;
      }
      const id = randomUUID();
      patch({
        currentParticipantId: id,
        participants: [
          { id, name: identity.name, email: identity.email },
          ...draw.participants,
        ],
      });
    }
  }
  function addRule() {
    if (!giver || !recipient || giver === recipient) {
      setMessage("Elige dos personas diferentes.");
      return;
    }
    const additions = [
      { giverId: giver, recipientId: recipient },
      ...(mutual ? [{ giverId: recipient, recipientId: giver }] : []),
    ];
    const combined = [...draw.exclusions];
    for (const item of additions)
      if (
        !combined.some(
          (r) =>
            r.giverId === item.giverId && r.recipientId === item.recipientId,
        )
      )
        combined.push(item);
    patch({ exclusions: combined });
    setMessage("");
    setGiver("");
    setRecipient("");
  }
  return (
    <Shell>
      <View pointerEvents={saving ? "none" : "auto"} style={{ gap: 25 }}>
        <View style={[s.between, { flexWrap: "wrap" }]}>
          <View style={{ gap: 8, flexShrink: 1, maxWidth: "100%" }}>
            <Chip>
              {initial.title ? "Editar borrador" : "Una nueva sorpresa"}
            </Chip>
            <Heading size={width > 600 ? 34 : 29}>
              {step === 0
                ? "Todo empieza con un buen plan."
                : step === 1
                  ? "Las personas lo hacen especial."
                  : step === 2
                    ? "Cada grupo tiene sus reglas."
                    : "Ya casi puedes guardar la sorpresa."}
            </Heading>
          </View>
          <Button
            variant="quiet"
            small
            disabled={saving}
            onPress={() => void saveDraft()}
          >
            {saving ? "Guardando…" : "Guardar y salir"}
          </Button>
        </View>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {steps.map((label, index) => (
            <View
              key={label}
              style={{
                flexGrow: 1,
                flexBasis: width > 650 ? "20%" : "44%",
                flexDirection: "row",
                alignItems: "center",
                gap: 9,
                borderRadius: 13,
                padding: 12,
                backgroundColor:
                  index === step
                    ? c.blue
                    : index < step
                      ? c.mintLight
                      : "#EFEDE7",
              }}
            >
              <View
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 13,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: index === step ? "#FFFFFF2B" : c.paper,
                }}
              >
                {index < step ? (
                  <Icon name="check" size={16} color={c.green} />
                ) : (
                  <Text
                    style={{
                      fontFamily: f.bold,
                      fontSize: 12,
                      color: index === step ? "white" : c.muted,
                    }}
                  >
                    {index + 1}
                  </Text>
                )}
              </View>
              <Text
                style={{
                  fontFamily: f.bold,
                  fontSize: 13,
                  color: index === step ? "white" : c.ink,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>
        {saveError && <Notice error>{saveError}</Notice>}
        <Card
          style={{
            maxWidth: 850,
            width: "100%",
            alignSelf: "center",
            padding: width > 650 ? 32 : 21,
            gap: 23,
          }}
        >
          {step === 0 && (
            <>
              <Heading size={25}>Cuéntanos el plan</Heading>
              <Field
                editable={!saving}
                label="Nombre del sorteo"
                placeholder="Por ejemplo: La pandilla de siempre"
                value={draw.title}
                onChangeText={(title) => patch({ title })}
                maxLength={100}
                error={errors.title}
              />
              <Field
                editable={!saving}
                label="Descripción"
                placeholder="¿Qué celebráis? ¿Alguna pista para los regalos?"
                value={draw.description}
                onChangeText={(description) => patch({ description })}
                multiline
                maxLength={1000}
              />
              <Field
                editable={!saving}
                label="Presupuesto orientativo (€) · obligatorio"
                placeholder="25"
                keyboardType="decimal-pad"
                value={budget}
                onChangeText={setBudget}
                error={errors.budget}
                hint="Una referencia para elegir el regalo, no un límite de gasto."
              />
              <Field
                label="Fecha del intercambio · opcional"
                editable={!saving}
                placeholder="AAAA-MM-DD"
                value={draw.date}
                onChangeText={(date) => patch({ date })}
                maxLength={10}
                error={errors.date}
                hint="Por ahora usamos euros y una fecha opcional en esta vista previa."
              />
              <View style={{ gap: 12 }}>
                <Label>Un toque de color</Label>
                <View style={s.row}>
                  {(["blue", "coral", "mint"] as const).map((color) => (
                    <Pressable
                      key={color}
                      accessibilityRole="radio"
                      accessibilityLabel={`Color ${color === "blue" ? "azul" : color === "coral" ? "coral" : "menta"}`}
                      accessibilityState={{ checked: draw.color === color }}
                      onPress={() => patch({ color })}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 16,
                        backgroundColor:
                          color === "blue"
                            ? c.blue
                            : color === "coral"
                              ? c.coral
                              : c.mint,
                        alignItems: "center",
                        justifyContent: "center",
                        borderWidth: draw.color === color ? 3 : 0,
                        borderColor: c.ink,
                      }}
                    >
                      {draw.color === color && (
                        <Icon
                          name="check"
                          color={color === "blue" ? "white" : c.ink}
                        />
                      )}
                    </Pressable>
                  ))}
                </View>
              </View>
            </>
          )}
          {step === 1 && (
            <>
              <View style={s.between}>
                <Heading size={25}>¿Quién se apunta?</Heading>
                <Chip>{`${draw.participants.length} personas`}</Chip>
              </View>
              <View
                style={[
                  s.between,
                  {
                    backgroundColor: c.blueLight,
                    padding: 15,
                    borderRadius: 14,
                  },
                ]}
              >
                <View style={{ flex: 1, gap: 3 }}>
                  <Label>Yo también participo</Label>
                  <Body muted style={{ fontSize: 13 }}>
                    {mode === "demo"
                      ? "En este ejemplo eres Ana."
                      : `Te añadiremos como ${identity.name}. Esta opción no da acceso a resultados ni deseos ajenos.`}
                  </Body>
                </View>
                <Switch
                  disabled={saving || !identity.email}
                  accessibilityLabel="Yo también participo"
                  value={Boolean(draw.currentParticipantId)}
                  onValueChange={toggleMe}
                  trackColor={{ true: c.blue }}
                />
              </View>
              <Field
                editable={!saving}
                label="Nombre"
                placeholder="Lucía"
                value={name}
                onChangeText={setName}
                maxLength={80}
                error={errors.name}
              />
              <Field
                editable={!saving}
                label="Correo electrónico"
                placeholder="lucia@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                maxLength={254}
                error={errors.email}
                onSubmitEditing={addPerson}
              />
              <Button icon="plus" variant="secondary" onPress={addPerson}>
                Añadir persona
              </Button>
              {errors.people && <Notice error>{errors.people}</Notice>}
              <View style={{ gap: 9 }}>
                {draw.participants.map((person, index) => (
                  <View
                    key={person.id}
                    style={[
                      s.row,
                      {
                        borderBottomWidth: 1,
                        borderColor: c.line,
                        paddingVertical: 8,
                      },
                    ]}
                  >
                    <Avatar name={person.name} index={index} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        style={{
                          fontFamily: f.bold,
                          color: c.ink,
                          fontSize: 15,
                        }}
                      >
                        {person.name}
                        {person.id === draw.currentParticipantId ? " (tú)" : ""}
                      </Text>
                      <Text
                        style={{
                          fontFamily: f.body,
                          fontSize: 14,
                          color: c.muted,
                        }}
                      >
                        {person.email}
                      </Text>
                    </View>
                    <IconButton
                      name="close"
                      label={`Quitar a ${person.name}`}
                      onPress={() => removePerson(person.id)}
                    />
                  </View>
                ))}
              </View>
              <Body muted style={{ fontSize: 13 }}>
                Solo guardaremos este borrador en tu dispositivo. No se enviarán
                correos desde la vista previa.
              </Body>
            </>
          )}
          {step === 2 && (
            <>
              <Heading size={25}>Que la sorpresa encaje</Heading>
              <Body muted>
                Indica qué personas no pueden regalarse. Nadie se regala a sí
                mismo, así que no hace falta añadir esa regla.
              </Body>
              <PersonSelector
                label="Esta persona no puede regalar…"
                people={draw.participants}
                value={giver}
                onChange={setGiver}
              />
              <PersonSelector
                label="…a esta otra persona"
                people={draw.participants.filter((p) => p.id !== giver)}
                value={recipient}
                onChange={setRecipient}
              />
              <View style={s.between}>
                <Label>También al revés</Label>
                <Switch
                  accessibilityLabel="Hacer la excepción mutua"
                  value={mutual}
                  onValueChange={setMutual}
                  trackColor={{ true: c.blue }}
                />
              </View>
              <Button icon="plus" variant="secondary" onPress={addRule}>
                Añadir excepción
              </Button>
              {draw.exclusions.length === 0 ? (
                <View
                  style={{
                    backgroundColor: c.mintLight,
                    padding: 16,
                    borderRadius: 14,
                  }}
                >
                  <Body muted style={{ fontSize: 14 }}>
                    Sin excepciones por ahora. Todos pueden regalar a cualquier
                    otra persona.
                  </Body>
                </View>
              ) : (
                draw.exclusions.map((rule) => (
                  <View
                    key={`${rule.giverId}-${rule.recipientId}`}
                    style={[
                      s.row,
                      {
                        backgroundColor: c.coralLight,
                        padding: 12,
                        borderRadius: 13,
                      },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Body style={{ fontSize: 14 }}>
                        <Text style={{ fontFamily: f.bold }}>
                          {
                            draw.participants.find((p) => p.id === rule.giverId)
                              ?.name
                          }
                        </Text>{" "}
                        no puede regalar a{" "}
                        <Text style={{ fontFamily: f.bold }}>
                          {
                            draw.participants.find(
                              (p) => p.id === rule.recipientId,
                            )?.name
                          }
                        </Text>
                      </Body>
                    </View>
                    <IconButton
                      label="Eliminar excepción"
                      name="close"
                      onPress={() =>
                        patch({
                          exclusions: draw.exclusions.filter((r) => r !== rule),
                        })
                      }
                    />
                  </View>
                ))
              )}
            </>
          )}
          {step === 3 && (
            <>
              <Heading size={28}>{draw.title}</Heading>
              <Body muted>
                {draw.description || "Sin descripción adicional."}
              </Body>
              <View
                style={{
                  backgroundColor: c.blueLight,
                  borderRadius: 17,
                  padding: 20,
                  gap: 12,
                }}
              >
                <View style={s.between}>
                  <Label>Presupuesto orientativo</Label>
                  <Label>{money(parseBudget(budget))}</Label>
                </View>
                <View style={s.between}>
                  <Label>Participantes</Label>
                  <Label>{draw.participants.length}</Label>
                </View>
                <View style={s.between}>
                  <Label>Excepciones</Label>
                  <Label>{draw.exclusions.length}</Label>
                </View>
                <View style={s.between}>
                  <Label>Fecha</Label>
                  <Label>{draw.date || "Por decidir"}</Label>
                </View>
              </View>
              <Notice>
                {mode === "account"
                  ? "El borrador se guardará en tu cuenta. Todavía no se realizará el sorteo ni se enviarán correos."
                  : "El borrador se guardará en este dispositivo. La demo no realiza sorteos, envía correos ni cobra compras."}
              </Notice>
              <View style={{ gap: 9 }}>
                <Heading size={21}>Los deseos también cuentan</Heading>
                <Body muted>
                  Con la compra permanente del organizador, todos podrán añadir
                  texto, enlaces y fotografías. Solo los verá su autor y quien
                  deba regalarle.
                </Body>
                <Button variant="quiet" onPress={() => router.push("/premium")}>
                  Conocer las listas de deseos
                </Button>
              </View>
            </>
          )}
          {message && <Notice error>{message}</Notice>}
          <View
            style={[
              s.between,
              { borderTopWidth: 1, borderColor: c.line, paddingTop: 21 },
            ]}
          >
            {step > 0 ? (
              <Button
                disabled={saving}
                variant="quiet"
                onPress={() => {
                  setStep(step - 1);
                  setErrors({});
                  setMessage("");
                }}
              >
                Anterior
              </Button>
            ) : (
              <Button variant="quiet" onPress={() => router.push("/")}>
                Salir
              </Button>
            )}
            <Button
              disabled={saving}
              icon={step === 3 ? "check" : undefined}
              onPress={advance}
            >
              {saving
                ? "Guardando…"
                : step === 3
                  ? "Guardar borrador"
                  : "Continuar"}
            </Button>
          </View>
        </Card>
      </View>
    </Shell>
  );
}

function PersonSelector({
  label,
  people,
  value,
  onChange,
}: {
  label: string;
  people: Participant[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <View style={{ gap: 11 }}>
      <Label>{label}</Label>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {people.map((person) => (
          <Pressable
            key={person.id}
            accessibilityRole="radio"
            accessibilityLabel={person.name}
            accessibilityState={{ checked: person.id === value }}
            onPress={() => onChange(person.id)}
            style={{
              minHeight: 46,
              paddingHorizontal: 16,
              paddingVertical: 12,
              borderRadius: 13,
              borderWidth: 1,
              borderColor: person.id === value ? c.blue : c.line,
              backgroundColor: person.id === value ? c.blueLight : c.paper,
            }}
          >
            <Text
              style={{
                fontFamily: f.bold,
                fontSize: 14,
                color: person.id === value ? c.blue : c.ink,
              }}
            >
              {person.name}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

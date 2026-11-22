import { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { randomUUID } from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import {
  Image,
  Linking,
  Pressable,
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
  Loading,
  Notice,
  s,
} from "../components/ui";
import { Icon } from "../components/Icon";
import { colors as c, fonts as f } from "../theme";
import { useStore } from "../data/store";
import { safeWebLink, type Draw, type Wish } from "../domain/draw";

export default function Wishes() {
  const params = useLocalSearchParams<{ draw?: string; view?: string }>();
  const store = useStore();
  const eligible = store.draws.filter((d) => d.currentParticipantId);
  const [selected, setSelected] = useState(params.draw || "pandilla");
  const draw = store.draws.find((d) => d.id === selected);
  const recipientView = params.view === "recipient";
  if (store.mode === "account")
    return (
      <Shell>
        <Heading>Los deseos llegarán pronto</Heading>
        <Body muted>
          Estamos preparando las listas privadas y la compra permanente. Tus
          borradores ya tienen su propio espacio; aquí todavía no se guardan
          deseos ni fotografías.
        </Body>
        <Button onPress={() => router.replace("/")}>Ver mis sorteos</Button>
      </Shell>
    );
  if (!store.ready)
    return (
      <Shell>
        <Loading />
      </Shell>
    );
  const personId = recipientView
    ? draw?.demoRecipientId
    : draw?.currentParticipantId;
  if (!draw || !personId || (recipientView && draw.status !== "drawn"))
    return (
      <Shell>
        <Heading>Tu lista empieza con un grupo</Heading>
        <Body muted>
          Para escribir deseos tienes que participar en un sorteo. Puedes
          explorar la lista del grupo de ejemplo.
        </Body>
        <Button onPress={() => router.replace("/deseos?draw=pandilla")}>
          Ver mis deseos de ejemplo
        </Button>
      </Shell>
    );
  return (
    <Shell>
      <View style={{ gap: 10 }}>
        <Chip>
          {recipientView
            ? "Una pista para su regalo"
            : "Tus pequeñas ilusiones"}
        </Chip>
        <Heading size={34}>
          {recipientView
            ? "Algo que le haga sonreír."
            : "Pedir también tiene su magia."}
        </Heading>
        <Body muted>
          {recipientView
            ? "Solo puedes ver los deseos de la persona a quien te toca regalar."
            : "Comparte alguna idea. Solo la verás tú y la persona que deba regalarte."}
        </Body>
      </View>
      {!recipientView && (
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          {eligible.map((group) => (
            <Pressable
              key={group.id}
              accessibilityRole="tab"
              accessibilityState={{ selected: group.id === selected }}
              onPress={() => setSelected(group.id)}
              style={{
                minHeight: 44,
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 13,
                backgroundColor: group.id === selected ? c.blue : c.paper,
                borderWidth: 1,
                borderColor: group.id === selected ? c.blue : c.line,
              }}
            >
              <Text
                style={{
                  fontFamily: f.bold,
                  fontSize: 14,
                  color: group.id === selected ? "white" : c.ink,
                }}
              >
                {group.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
      <WishContent
        key={`${draw.id}:${personId}:${recipientView}`}
        draw={draw}
        personId={personId}
        readOnly={recipientView}
      />
    </Shell>
  );
}

function WishContent({
  draw,
  personId,
  readOnly,
}: {
  draw: Draw;
  personId: string;
  readOnly: boolean;
}) {
  const { saveWishes, photos, setPhotos } = useStore();
  const person = draw.participants.find((p) => p.id === personId)!;
  const wishes = draw.wishlists[personId] ?? [];
  const [editor, setEditor] = useState<Wish | null>(null);
  const [draftPhotos, setDraftPhotos] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { width } = useWindowDimensions();
  function start(wish?: Wish) {
    setDraftPhotos(
      wish ? [...(photos[`${draw.id}:${personId}:${wish.id}`] ?? [])] : [],
    );
    setEditor(
      wish ? { ...wish } : { id: randomUUID(), title: "", note: "", link: "" },
    );
    setMessage("");
    setError("");
  }
  function save() {
    if (!editor) return;
    if (!editor.title.trim()) {
      setError("Ponle un título a este deseo.");
      return;
    }
    if (editor.link.trim() && !safeWebLink(editor.link.trim())) {
      setError("Usa un enlace completo que empiece por https:// o http://.");
      return;
    }
    const next = {
      ...editor,
      title: editor.title.trim(),
      note: editor.note.trim(),
      link: editor.link.trim(),
    };
    saveWishes(
      draw.id,
      personId,
      wishes.some((w) => w.id === next.id)
        ? wishes.map((w) => (w.id === next.id ? next : w))
        : [...wishes, next],
    );
    setPhotos(`${draw.id}:${personId}:${editor.id}`, draftPhotos);
    setEditor(null);
    setMessage("Deseo guardado en este dispositivo.");
    setError("");
  }
  async function pickPhoto() {
    if (!editor) return;
    const current = draftPhotos;
    if (current.length >= 3) {
      setError("En el prototipo puedes añadir hasta 3 fotos por deseo.");
      return;
    }
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.7,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) {
        setError("Elige una foto de hasta 5 MB para esta vista previa.");
        return;
      }
      if (
        asset.mimeType &&
        !["image/jpeg", "image/png", "image/webp"].includes(asset.mimeType)
      ) {
        setError("Usa una fotografía JPG, PNG o WebP.");
        return;
      }
      setDraftPhotos([...current, asset.uri]);
      setError("");
    } catch {
      setError("No se pudo abrir la fotografía. Prueba otra vez.");
    }
  }
  return (
    <>
      <View style={[s.between, { flexWrap: "wrap" }]}>
        <View style={s.row}>
          <Avatar name={person.name} size={45} />
          <View>
            <Heading size={23}>
              {readOnly ? `Los deseos de ${person.name}` : "Mi lista de deseos"}
            </Heading>
            <Body muted style={{ fontSize: 13 }}>
              {draw.title}
            </Body>
          </View>
        </View>
        {!readOnly && !editor && (
          <Button icon="plus" onPress={() => start()}>
            Añadir deseo
          </Button>
        )}
      </View>
      <Notice>
        {readOnly
          ? "Lista de ejemplo de tu destinataria. La compra y los permisos del servidor aún no están conectados."
          : "Las listas son una función de pago del organizador. En esta vista previa puedes probarlas sin comprar nada; no se ha realizado ningún cobro."}
      </Notice>
      {editor && (
        <Card
          style={{ gap: 18, maxWidth: 750, width: "100%", alignSelf: "center" }}
        >
          <View style={s.between}>
            <Heading size={24}>
              {wishes.some((w) => w.id === editor.id)
                ? "Editar deseo"
                : "Una idea para acertar"}
            </Heading>
            <IconButton
              label="Cerrar editor de deseo"
              name="close"
              onPress={() => {
                setEditor(null);
                setError("");
              }}
            />
          </View>
          <Field
            label="¿Qué te haría ilusión?"
            placeholder="Un libro para perderme entre páginas"
            value={editor.title}
            onChangeText={(title) => setEditor({ ...editor, title })}
            maxLength={120}
          />
          <Field
            label="Alguna pista más · opcional"
            placeholder="Colores, tallas, estilos… o simplemente: ¡sorpréndeme!"
            value={editor.note}
            onChangeText={(note) => setEditor({ ...editor, note })}
            multiline
            maxLength={1000}
          />
          <Field
            label="Enlace · opcional"
            placeholder="https://…"
            value={editor.link}
            onChangeText={(link) => setEditor({ ...editor, link })}
            autoCapitalize="none"
            keyboardType="url"
            maxLength={2000}
          />
          <Button variant="secondary" icon="photo" onPress={pickPhoto}>
            Añadir fotografía
          </Button>
          <Body muted style={{ fontSize: 13 }}>
            Hasta 3 fotos por deseo y 5 MB por foto en este prototipo. Se
            muestran solo durante esta sesión y no se suben a ningún servidor.
          </Body>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
            {draftPhotos.map((uri, index) => (
              <View key={uri} style={{ gap: 2 }}>
                <Image
                  source={{ uri }}
                  accessibilityLabel={`Fotografía ${index + 1} de tu deseo`}
                  style={{ width: 110, height: 110, borderRadius: 13 }}
                />
                <Button
                  small
                  variant="quiet"
                  onPress={() =>
                    setDraftPhotos(draftPhotos.filter((photo) => photo !== uri))
                  }
                >
                  Quitar foto
                </Button>
              </View>
            ))}
          </View>
          {error && <Notice error>{error}</Notice>}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "flex-end",
              gap: 10,
            }}
          >
            <Button
              variant="quiet"
              onPress={() => {
                setEditor(null);
                setError("");
              }}
            >
              Cancelar
            </Button>
            <Button icon="check" onPress={save}>
              Guardar deseo
            </Button>
          </View>
        </Card>
      )}
      {message && <Notice>{message}</Notice>}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 20 }}>
        {wishes.map((wish, index) => (
          <Card
            key={wish.id}
            style={{
              flexGrow: 1,
              flexBasis: width > 800 ? "44%" : "100%",
              minWidth: 0,
            }}
          >
            <View style={s.between}>
              <View
                style={{
                  width: 47,
                  height: 47,
                  backgroundColor: [c.coralLight, c.mintLight, c.blueLight][
                    index % 3
                  ],
                  borderRadius: 15,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon name="heart" color={c.blue} />
              </View>
              {!readOnly && (
                <View style={s.row}>
                  <IconButton
                    name="settings"
                    label={`Editar ${wish.title}`}
                    onPress={() => start(wish)}
                  />
                  <IconButton
                    name="trash"
                    label={`Eliminar ${wish.title}`}
                    onPress={() => {
                      saveWishes(
                        draw.id,
                        personId,
                        wishes.filter((w) => w.id !== wish.id),
                      );
                      setPhotos(`${draw.id}:${personId}:${wish.id}`, []);
                      setMessage("Deseo eliminado de tu lista.");
                    }}
                  />
                </View>
              )}
            </View>
            <Heading size={23}>{wish.title}</Heading>
            {wish.note && <Body muted>{wish.note}</Body>}
            {(photos[`${draw.id}:${personId}:${wish.id}`] ?? []).map(
              (uri, i) => (
                <Image
                  key={uri}
                  source={{ uri }}
                  accessibilityLabel={`Fotografía ${i + 1} de ${wish.title}`}
                  resizeMode="cover"
                  style={{ width: "100%", height: 200, borderRadius: 15 }}
                />
              ),
            )}
            {wish.link && safeWebLink(wish.link) && (
              <Button
                variant="secondary"
                icon="link"
                onPress={() =>
                  Linking.openURL(wish.link).catch(() =>
                    setMessage("No se ha podido abrir el enlace."),
                  )
                }
              >
                Abrir enlace del regalo
              </Button>
            )}
          </Card>
        ))}
      </View>
      {wishes.length === 0 && !editor && (
        <Card style={{ alignItems: "center", paddingVertical: 40, gap: 16 }}>
          <View
            style={{
              backgroundColor: c.coralLight,
              padding: 20,
              borderRadius: 25,
            }}
          >
            <Icon name="heart" size={38} color="#B6553A" />
          </View>
          <Heading size={25}>
            {readOnly
              ? "Todavía no ha escrito sus deseos"
              : "Deja una pequeña pista"}
          </Heading>
          <Body muted style={{ textAlign: "center" }}>
            {readOnly
              ? "Puedes volver más adelante. Siempre queda la magia de sorprender."
              : "Una idea, una foto, algo que te encante. No hace falta que sea una lista larga."}
          </Body>
          {!readOnly && (
            <Button icon="plus" onPress={() => start()}>
              Escribir mi primer deseo
            </Button>
          )}
        </Card>
      )}
    </>
  );
}

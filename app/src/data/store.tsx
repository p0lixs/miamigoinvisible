import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { useAuth } from "../auth/session";
import { supabase } from "../auth/supabase";
import { Loading } from "../components/ui";
import { DraftError } from "../domain/draft";
import { createDraftRepository } from "./draft-repository";
import { demoDraws } from "./demo";
import { duplicateDraw, type Draw, type Wish } from "../domain/draw";

const KEY = "mi-amigo-invisible:prototype:v1";
type Store = {
  mode: "demo" | "account";
  identity: { name: string; email: string };
  draws: Draw[];
  ready: boolean;
  storageError: string | null;
  loadError: boolean;
  saving: boolean;
  reload: () => Promise<void>;
  save: (draw: Draw) => Promise<Draw>;
  generate: (draw: Draw) => Promise<Draw>;
  copy: (draw: Draw) => Promise<string>;
  saveWishes: (drawId: string, personId: string, wishes: Wish[]) => void;
  photos: Record<string, string[]>;
  setPhotos: (key: string, uris: string[]) => void;
};
const Context = createContext<Store | null>(null);
// Las fotos permanecen en memoria. Nunca persistimos credenciales ni asignaciones reales.
export function StoreProvider({ children }: { children: ReactNode }) {
  const { session, ready } = useAuth();
  if (!ready) return <Loading />;
  // Cambiar de cuenta desmonta también las pantallas y cualquier formulario abierto.
  return session ? (
    <CloudStoreProvider key={session.user.id} user={session.user}>
      {children}
    </CloudStoreProvider>
  ) : (
    <DemoStoreProvider key="demo">{children}</DemoStoreProvider>
  );
}

function DemoStoreProvider({ children }: { children: ReactNode }) {
  const [draws, setDraws] = useState<Draw[]>(demoDraws);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [photos, setPhotoState] = useState<Record<string, string[]>>({});
  const writes = useRef(Promise.resolve());
  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!active || !raw) return;
        const parsed: unknown = JSON.parse(raw);
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (d) =>
              d &&
              typeof d.id === "string" &&
              typeof d.title === "string" &&
              Array.isArray(d.participants) &&
              Array.isArray(d.exclusions) &&
              typeof d.wishlists === "object" &&
              d.wishlists !== null,
          )
        )
          setDraws(parsed as Draw[]);
      })
      .catch(() => {
        if (active) setStorageError(true);
      })
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!ready) return;
    const serialized = JSON.stringify(draws);
    writes.current = writes.current
      .then(() => AsyncStorage.setItem(KEY, serialized))
      .catch(() => setStorageError(true));
  }, [draws, ready]);
  const save = async (draw: Draw) => {
    setDraws((all) =>
      all.some((d) => d.id === draw.id)
        ? all.map((d) => (d.id === draw.id ? draw : d))
        : [draw, ...all],
    );
    return draw;
  };
  const copy = async (draw: Draw) => {
    const next = duplicateDraw(draw, randomUUID);
    await save(next);
    return next.id;
  };
  const saveWishes = (drawId: string, personId: string, wishes: Wish[]) =>
    setDraws((all) =>
      all.map((d) =>
        d.id === drawId
          ? { ...d, wishlists: { ...d.wishlists, [personId]: wishes } }
          : d,
      ),
    );
  return (
    <Context.Provider
      value={{
        mode: "demo",
        identity: { name: "Ana", email: "ana@example.com" },
        draws,
        ready,
        storageError: storageError
          ? "No se han podido guardar los cambios de la demo en este dispositivo."
          : null,
        loadError: false,
        saving: false,
        reload: async () => {},
        save,
        generate: async () => {
          throw new DraftError(
            "La demo no realiza sorteos reales. Entra con tu cuenta para organizar uno.",
          );
        },
        copy,
        saveWishes,
        photos,
        setPhotos: (key, uris) =>
          setPhotoState((all) => ({ ...all, [key]: uris })),
      }}
    >
      {children}
    </Context.Provider>
  );
}

function CloudStoreProvider({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  const metadataName: unknown = user.user_metadata.full_name;
  const identity = {
    name:
      typeof metadataName === "string" && metadataName.trim()
        ? metadataName.slice(0, 80)
        : "Yo",
    email: user.email ?? "",
  };
  const repository = useMemo(
    () =>
      createDraftRepository(
        supabase!,
        { id: user.id, email: user.email ?? "" },
        randomUUID,
      ),
    [user.id, user.email],
  );
  const [draws, setDraws] = useState<Draw[]>([]);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [saving, setSaving] = useState(false);
  const active = useRef(false);
  const revision = useRef(0);
  const pending = useRef(false);
  const copies = useRef(new Map<string, Draw>());
  const load = useCallback(() => {
    if (!active.current || pending.current) return Promise.resolve();
    const request = ++revision.current;
    return repository
      .list()
      .then((next) => {
        if (active.current && request === revision.current) {
          setDraws(next);
          setLoadError(false);
        }
      })
      .catch((error) => {
        if (active.current && request === revision.current) {
          setStorageError(
            error instanceof DraftError
              ? error.message
              : "No se han podido cargar tus sorteos.",
          );
          setDraws([]);
          setLoadError(true);
        }
      })
      .finally(() => {
        if (active.current && request === revision.current) setReady(true);
      });
  }, [repository]);
  const reload = useCallback(async () => {
    if (!active.current || pending.current) return;
    setReady(false);
    setStorageError(null);
    await load();
  }, [load]);
  useEffect(() => {
    active.current = true;
    void load();
    return () => {
      active.current = false;
    };
  }, [load]);
  const write = async (operation: () => Promise<Draw>) => {
    if (!active.current || pending.current || !ready || loadError)
      throw new DraftError("Espera a que termine la carga antes de guardar.");
    pending.current = true;
    setSaving(true);
    // Invalida lecturas anteriores para que no puedan reemplazar un guardado.
    revision.current++;
    try {
      const saved = await operation();
      if (!active.current)
        throw new DraftError(
          "La sesión ha cambiado. Vuelve a abrir tus sorteos.",
        );
      setDraws((all) => [saved, ...all.filter((d) => d.id !== saved.id)]);
      return saved;
    } finally {
      pending.current = false;
      if (active.current) setSaving(false);
    }
  };
  const save = (draw: Draw) => write(() => repository.save(draw));
  return (
    <Context.Provider
      value={{
        mode: "account",
        identity,
        draws,
        ready,
        storageError,
        loadError,
        saving,
        reload,
        save,
        generate: (draw) => write(() => repository.generate(draw)),
        copy: async (draw) => {
          const key = `${draw.id}:${draw.version ?? 0}`;
          let duplicate = copies.current.get(key);
          if (!duplicate) {
            duplicate = duplicateDraw(draw, randomUUID);
            copies.current.set(key, duplicate);
          }
          const saved = await save(duplicate);
          copies.current.delete(key);
          return saved.id;
        },
        // Los deseos tienen su propio modelo y permisos: nunca forman parte del borrador.
        saveWishes: () => {
          throw new DraftError(
            "Las listas de deseos de tu cuenta aún no están disponibles.",
          );
        },
        photos: {},
        setPhotos: () => {},
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("StoreProvider required");
  return store;
}

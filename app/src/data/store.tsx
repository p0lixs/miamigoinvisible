import AsyncStorage from "@react-native-async-storage/async-storage";
import { randomUUID } from "expo-crypto";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { demoDraws } from "./demo";
import { duplicateDraw, type Draw, type Wish } from "../domain/draw";

const KEY = "mi-amigo-invisible:prototype:v1";
type Store = {
  draws: Draw[];
  ready: boolean;
  storageError: boolean;
  save: (draw: Draw) => void;
  copy: (draw: Draw) => string;
  saveWishes: (drawId: string, personId: string, wishes: Wish[]) => void;
  photos: Record<string, string[]>;
  setPhotos: (key: string, uris: string[]) => void;
};
const Context = createContext<Store | null>(null);
// Las fotos permanecen en memoria. Nunca persistimos credenciales ni asignaciones reales.
export function StoreProvider({ children }: { children: ReactNode }) {
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
  const save = (draw: Draw) =>
    setDraws((all) =>
      all.some((d) => d.id === draw.id)
        ? all.map((d) => (d.id === draw.id ? draw : d))
        : [draw, ...all],
    );
  const copy = (draw: Draw) => {
    const next = duplicateDraw(draw, randomUUID);
    save(next);
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
        draws,
        ready,
        storageError,
        save,
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
export function useStore() {
  const store = useContext(Context);
  if (!store) throw new Error("StoreProvider required");
  return store;
}

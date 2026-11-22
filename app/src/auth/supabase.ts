import "react-native-url-polyfill/auto";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient, processLock } from "@supabase/supabase-js";
import { Platform } from "react-native";
import { publicSupabaseConfig } from "../domain/auth";

// Expo sustituye estas referencias directas durante la exportación web/móvil.
export const supabaseConfig = publicSupabaseConfig(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
);

export const supabase = supabaseConfig
  ? createClient(supabaseConfig.url, supabaseConfig.key, {
      auth: {
        ...(Platform.OS !== "web"
          ? { storage: AsyncStorage, lock: processLock }
          : {}),
        flowType: "pkce",
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : null;

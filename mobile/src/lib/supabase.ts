import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { Platform } from "react-native";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  // createClient() throws synchronously on a missing url/key, which would crash the
  // whole app at import time instead of failing individual requests.
  console.error("Missing EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY — check environment configuration.");
}

export const supabase = createClient(
  url || "https://missing-config.supabase.co",
  key || "missing-config",
  {
    auth: {
      // AsyncStorage touches `window` during init, which doesn't exist during Expo
      // Router's web SSR pre-render pass (Node context). On web, let supabase-js fall
      // back to its own browser-safe storage (localStorage) instead.
      storage: Platform.OS === "web" ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

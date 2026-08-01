import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  // createClient() throws synchronously on a missing url/key, which would crash the
  // whole app at import time (blank page) instead of failing individual requests.
  console.error("Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — check environment configuration.");
}

export const supabase = createClient(url || "https://missing-config.supabase.co", key || "missing-config");

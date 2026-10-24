import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zkapzemkwsllflcyviga.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprYXB6ZW1rd3NsbGZsY3l2aWdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA0OTk4MDAsImV4cCI6MjEwNjA3NTgwMH0.Chst6MpLctVODfv_T0EBzAk4eAsiIAFU7fWHDnl80Q4";

let browserClient: ReturnType<typeof createClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    browserClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 20,
        },
      },
    });
  }
  return browserClient;
}

export default getSupabaseBrowserClient;

"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

export type BrowserClient = ReturnType<typeof createBrowserClient<Database>>;

let cached: BrowserClient | null = null;

/**
 * Browser-side Supabase client, shared across the app so there is a single
 * auth listener and a single cached session. Reads and writes go out with the
 * signed-in admin's cookie, so RLS — not this code — decides what is allowed.
 */
export function supabaseBrowser(): BrowserClient {
  if (cached) return cached;
  const { url, anonKey } = supabaseEnv();
  cached = createBrowserClient<Database>(url, anonKey);
  return cached;
}

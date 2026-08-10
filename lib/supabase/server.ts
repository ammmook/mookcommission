import { cookies } from "next/headers";
import { connection } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import { supabaseEnv } from "./env";

export type ServerClient = ReturnType<typeof createServerClient<Database>>;

/**
 * Anonymous client for the three customer-facing RPCs.
 *
 * Deliberately cookie-free: the landing page and queue pages must behave the
 * same for everyone, and an admin browsing them should not have their JWT
 * attached to a public query.
 *
 * `connection()` marks the caller as request-time. Without it the landing page
 * prerenders as a static shell and the Suspense boundary around the lot pill is
 * *postponed* — the resolved markup ends up in the HTML but nothing ever swaps
 * it in, so the fallback sticks forever. It also keeps the queue count live
 * rather than frozen at build time.
 */
export async function supabasePublic(): Promise<ServerClient> {
  await connection();
  const { url, anonKey } = supabaseEnv();

  return createClient<Database>(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as unknown as ServerClient;
}

/**
 * Server-side Supabase client bound to the request's cookies.
 *
 * Use from Server Components, Server Actions and Route Handlers. In a Server
 * Component the cookie store is read-only, so writes from a token refresh throw
 * — that is expected and swallowed below, because `proxy.ts` refreshes the
 * session on every request and its response *can* carry the updated cookies.
 */
export async function supabaseServer(): Promise<ServerClient> {
  const { url, anonKey } = supabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — proxy.ts handles the refresh.
        }
      },
    },
  });
}

/**
 * The signed-in admin, or null.
 *
 * Always resolved through `getUser()` (which verifies the JWT with Supabase)
 * rather than `getSession()`, whose cookie payload is not trustworthy on the
 * server. Membership is confirmed against the `admins` table — never by
 * comparing email addresses.
 */
export async function getAdmin(): Promise<{
  id: string;
  displayName: string;
} | null> {
  const supabase = await supabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // `admin_self` policy limits this to the caller's own row.
  const { data } = await supabase
    .from("admins")
    .select("id, display_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!data) return null;
  return { id: data.id, displayName: data.display_name };
}

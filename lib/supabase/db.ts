import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * A Supabase client of either flavour. Every function in the data access layer
 * takes one of these, so the same query works from a Server Component
 * (`supabaseServer()`) and from the admin store in the browser
 * (`supabaseBrowser()`).
 */
export type Db = SupabaseClient<Database>;

/**
 * Returns `data`, or throws the Postgrest error so callers can funnel it
 * through `reportError`.
 *
 * The parameter is spelled as the same discriminated union Postgrest returns,
 * which is what lets `T` land on the success shape — take `{ data: T | null }`
 * instead and every call site inherits a spurious `| null`.
 */
export function unwrap<T>(
  result: { data: T; error: null } | { data: null; error: unknown },
): T {
  if (result.error !== null) throw result.error;
  return result.data as T;
}

/**
 * `unwrap` for a `.single()` that must have produced a row.
 *
 * Postgrest types `insert().select().single()` as nullable even though a
 * successful write always returns the row; this turns that into a thrown error
 * rather than a `null` that spreads through the mappers.
 */
export function unwrapOne<T>(
  result: { data: T; error: unknown },
  notFound = "ไม่พบข้อมูลที่ต้องการ",
): NonNullable<T> {
  if (result.error) throw result.error;
  if (result.data === null || result.data === undefined) {
    throw new Error(notFound);
  }
  return result.data as NonNullable<T>;
}

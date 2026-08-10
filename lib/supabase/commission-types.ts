/**
 * `commission_types` — the list behind the "ประเภทงาน" dropdowns.
 *
 * The values used to be hard-coded in two components. They now come from a
 * table so the artist can change them without a deploy; `queue_entries`
 * still stores the chosen name as text, so renaming a type later never
 * rewrites what an existing customer was quoted.
 */

import type { Db } from "./db";

/** Used until migration 002 has been run, and as the floor if the table is empty. */
export const DEFAULT_COMMISSION_TYPES = ["Bust", "Half Body", "Full Body"];

/**
 * The migration has not been applied yet.
 *
 * PostgREST answers a request for an unknown table from its schema cache with
 * `PGRST205` / 404 — it never reaches Postgres, so `42P01` does not come back
 * here. Both are accepted because `42P01` can still surface if the table is
 * dropped while the cache is warm. Verified against a live project.
 */
const MISSING_TABLE_CODES = ["PGRST205", "42P01"];

/**
 * Active types in display order.
 *
 * Falls back to the built-in list rather than throwing when the table is
 * missing, so the app keeps working between deploying this code and running
 * the migration.
 */
export async function listCommissionTypes(db: Db): Promise<string[]> {
  const { data, error } = await db
    .from("commission_types")
    .select("name, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  if (error) {
    if (MISSING_TABLE_CODES.includes(error.code)) {
      console.warn(
        "[torqueue] commission_types ยังไม่มีในฐานข้อมูล — ใช้ค่าเริ่มต้นไปก่อน " +
          "(รัน schema/002-flexible-code-and-commission-types.sql)",
      );
      return DEFAULT_COMMISSION_TYPES;
    }
    throw error;
  }

  const names = (data ?? []).map((row) => row.name).filter(Boolean);
  return names.length > 0 ? names : DEFAULT_COMMISSION_TYPES;
}

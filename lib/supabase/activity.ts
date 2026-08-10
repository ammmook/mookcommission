/**
 * `activity_logs` — read-only from the frontend's point of view.
 *
 * The `log_entry_change()` trigger writes a row whenever stage, state or
 * payment status changes. Writing one from here too would double every entry
 * in the "ประวัติ" list, so nothing in this file inserts.
 */

import type { Db } from "./db";
import { unwrap } from "./db";
import type { ActivityLogRow } from "./database.types";

const ACTIVITY_COLUMNS = "id, entry_id, action, detail, actor_id, created_at";

/** Newest first — the order the history list renders in. */
export async function listActivity(
  db: Db,
  entryId: string,
  limit = 30,
): Promise<ActivityLogRow[]> {
  return unwrap(
    await db
      .from("activity_logs")
      .select(ACTIVITY_COLUMNS)
      .eq("entry_id", entryId)
      .order("created_at", { ascending: false })
      .limit(limit),
  );
}

export async function listActivityByEntries(
  db: Db,
  entryIds: string[],
): Promise<Map<string, ActivityLogRow[]>> {
  const grouped = new Map<string, ActivityLogRow[]>();
  if (entryIds.length === 0) return grouped;

  const rows = unwrap(
    await db
      .from("activity_logs")
      .select(ACTIVITY_COLUMNS)
      .in("entry_id", entryIds)
      .order("created_at", { ascending: false }),
  );

  for (const row of rows) {
    const list = grouped.get(row.entry_id) ?? [];
    list.push(row);
    grouped.set(row.entry_id, list);
  }
  return grouped;
}

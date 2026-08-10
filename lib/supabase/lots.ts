/**
 * `lots` and the `lot_progress` view.
 *
 * The database enforces "only one open lot" with a partial unique index
 * (`one_open_lot`), so anything that opens a lot has to close the incumbent
 * first — otherwise the insert/update is rejected. That ordering lives here so
 * no component has to know about it.
 */

import type { Db } from "./db";
import { unwrap, unwrapOne } from "./db";
import { mapLot, mapLotProgress } from "./map";
import type { Lot, LotProgress, LotStatus } from "@/lib/types";

const LOT_COLUMNS = "lot_number, capacity, status, opened_at, closed_at, note";

/** Newest lot first, matching the order the dashboard and lot screen expect. */
export async function listLots(db: Db): Promise<Lot[]> {
  const rows = unwrap(
    await db.from("lots").select(LOT_COLUMNS).order("lot_number", {
      ascending: false,
    }),
  );
  return rows.map(mapLot);
}

export async function listLotProgress(db: Db): Promise<LotProgress[]> {
  const rows = unwrap(
    await db
      .from("lot_progress")
      .select(
        "lot_number, capacity, status, opened_at, closed_at, total_entries, done_count, current_queue_number",
      )
      .order("lot_number", { ascending: false }),
  );
  return rows.map(mapLotProgress);
}

/** Closes every currently open lot. Safe to call when none are open. */
async function closeOpenLots(db: Db, exceptLotNumber?: number): Promise<void> {
  const query = db
    .from("lots")
    .update({ status: "closed", closed_at: new Date().toISOString() })
    .eq("status", "open");

  const { error } =
    exceptLotNumber === undefined
      ? await query
      : await query.neq("lot_number", exceptLotNumber);

  if (error) throw error;
}

/**
 * Creates the next lot and hands it the open slot.
 *
 * `lot_number` is the primary key and has no sequence behind it, so the next
 * number is derived here. A concurrent create would collide on the primary key
 * rather than silently reuse a number — which is the safe failure.
 */
export async function createLot(db: Db, capacity: number): Promise<Lot> {
  const latest = unwrap(
    await db
      .from("lots")
      .select("lot_number")
      .order("lot_number", { ascending: false })
      .limit(1),
  );
  const nextNumber = (latest[0]?.lot_number ?? 0) + 1;

  await closeOpenLots(db);

  const row = unwrapOne(
    await db
      .from("lots")
      .insert({ lot_number: nextNumber, capacity, status: "open" })
      .select(LOT_COLUMNS)
      .single(),
  );
  return mapLot(row);
}

export async function updateLotCapacity(
  db: Db,
  lotNumber: number,
  capacity: number,
): Promise<Lot> {
  const row = unwrapOne(
    await db
      .from("lots")
      .update({ capacity })
      .eq("lot_number", lotNumber)
      .select(LOT_COLUMNS)
      .single(),
  );
  return mapLot(row);
}

/**
 * Opens or closes a lot. Reopening closes whichever lot currently holds the
 * open slot, because the schema allows exactly one.
 */
export async function setLotStatus(
  db: Db,
  lotNumber: number,
  status: LotStatus,
): Promise<Lot> {
  if (status === "active") {
    await closeOpenLots(db, lotNumber);
  }

  const patch =
    status === "active"
      ? { status: "open" as const, closed_at: null, opened_at: new Date().toISOString() }
      : { status: "closed" as const, closed_at: new Date().toISOString() };

  const row = unwrapOne(
    await db
      .from("lots")
      .update(patch)
      .eq("lot_number", lotNumber)
      .select(LOT_COLUMNS)
      .single(),
  );
  return mapLot(row);
}

/**
 * Deletes a lot. `queue_entries.lot_number` is `on delete restrict`, so the
 * caller must empty the lot first — `deleteLot` in the admin store does that,
 * and a leftover entry surfaces as the "ลบไม่ได้เพราะยังมีข้อมูลอื่นอ้างอิงอยู่"
 * message rather than a silent no-op.
 */
export async function deleteLot(db: Db, lotNumber: number): Promise<void> {
  const { error } = await db.from("lots").delete().eq("lot_number", lotNumber);
  if (error) throw error;
}

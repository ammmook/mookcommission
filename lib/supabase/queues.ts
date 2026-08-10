/**
 * `queue_entries` — the admin side of the queue.
 *
 * Queue numbers are the database's job: the `assign_queue_number()` trigger
 * issues them on insert and rejects closed or full lots. Nothing here
 * recalculates that on create. The one exception is `moveQueueEntry`, because
 * the trigger is BEFORE INSERT only and an update that changes `lot_number`
 * never reaches it.
 */

import type { Db } from "./db";
import { unwrap, unwrapOne } from "./db";
import { listActivityByEntries, listActivity } from "./activity";
import { mapQueueEntry } from "./map";
import { listQuotationsByEntries, getQuotationByEntry } from "./quotations";
import { listSketchesByEntries, listSketches } from "./sketches";
import type { QueueEntryRow } from "./database.types";
import type { Customer, PaymentStatus, QueueState, Stage } from "@/lib/types";

const ENTRY_COLUMNS = `
  id, lot_number, queue_number, code, customer_name, contact,
  commission_type, character_count, dimensions, note,
  stage, state, paused_at, resume_expected_at, cancelled_at,
  payment_status, amount_paid, paid_at, created_at, updated_at
`;

/**
 * Every entry, with sketches, activity and quotation attached.
 *
 * Four queries rather than one per customer — the admin screens all render the
 * whole roster, so fanning out per row would be noticeably slower on a full lot.
 */
export async function listCustomers(db: Db): Promise<Customer[]> {
  const rows = unwrap(
    await db
      .from("queue_entries")
      .select(ENTRY_COLUMNS)
      .order("lot_number", { ascending: false })
      .order("queue_number", { ascending: true }),
  );
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const [sketches, activity, quotations] = await Promise.all([
    listSketchesByEntries(db, ids),
    listActivityByEntries(db, ids),
    listQuotationsByEntries(db, ids),
  ]);

  return rows.map((row) =>
    mapQueueEntry(row, {
      sketches: sketches.get(row.id) ?? [],
      activity: activity.get(row.id) ?? [],
      quotation: quotations.get(row.id) ?? null,
    }),
  );
}

/** Single entry by public code — the admin editor's lookup. */
export async function getCustomerByCode(
  db: Db,
  code: string,
): Promise<Customer | null> {
  const row = unwrap(
    await db
      .from("queue_entries")
      .select(ENTRY_COLUMNS)
      // Exact match: the admin picks the code's casing, so it is preserved
      // rather than normalised. Customer-side lookup stays case-insensitive
      // because `find_queue()` compares with upper() in SQL.
      .eq("code", code.trim())
      .maybeSingle(),
  ) as QueueEntryRow | null;

  if (!row) return null;

  const [sketches, activity, quotation] = await Promise.all([
    listSketches(db, row.id),
    listActivity(db, row.id),
    getQuotationByEntry(db, row.id),
  ]);

  return mapQueueEntry(row, { sketches, activity, quotation });
}

export interface CreateQueueInput {
  lotNumber: number;
  code: string;
  name: string;
  commissionType: string;
  characterCount: number;
  dimensions?: string;
  note?: string;
  contact?: string;
}

/**
 * Longest code the schema accepts after migration 002.
 * Before that migration the database also enforced `^[A-Z]{2}[0-9]{3}$`; the
 * frontend no longer duplicates any format rule, so a code the old constraint
 * rejects surfaces as the mapped CHECK-violation message.
 */
export const CODE_MAX_LENGTH = 24;

/**
 * The admin chooses the code, so this only guards the two things the database
 * still insists on: not blank, not absurdly long. Uniqueness stays the
 * database's call.
 */
export function validateCode(code: string): string | null {
  const trimmed = code.trim();
  if (trimmed.length === 0) return "กรุณากรอกรหัสค้นหา";
  if (trimmed.length > CODE_MAX_LENGTH) {
    return `รหัสค้นหายาวเกินไป (ไม่เกิน ${CODE_MAX_LENGTH} ตัวอักษร)`;
  }
  return null;
}

/**
 * Inserts an entry. `queue_number` is left out on purpose so the trigger
 * assigns it and applies the capacity and lot-status rules in one place.
 */
export async function createQueueEntry(
  db: Db,
  input: CreateQueueInput,
): Promise<QueueEntryRow> {
  return unwrapOne(
    await db
      .from("queue_entries")
      .insert({
        lot_number: input.lotNumber,
        code: input.code.trim(),
        customer_name: input.name.trim(),
        commission_type: input.commissionType,
        character_count: input.characterCount,
        dimensions: input.dimensions?.trim() || null,
        note: input.note?.trim() || null,
        contact: input.contact?.trim() || null,
      })
      .select(ENTRY_COLUMNS)
      .single(),
  );
}

export interface QueuePatch {
  stage?: Stage;
  state?: QueueState;
  paymentStatus?: PaymentStatus;
  amountPaid?: number | null;
  code?: string;
  name?: string;
  commissionType?: string;
  characterCount?: number;
  dimensions?: string;
  note?: string;
  contact?: string;
  resumeExpectedAt?: string | null;
}

/**
 * Updates one entry.
 *
 * `paused_at`, `cancelled_at` and `paid_at` are all set by the
 * `log_entry_change()` trigger, so they are absent here — writing them from the
 * frontend would fight the database for ownership of the same fields.
 */
export async function updateQueueEntry(
  db: Db,
  id: string,
  patch: QueuePatch,
): Promise<QueueEntryRow> {
  const payload: Partial<QueueEntryRow> = {};

  if (patch.stage !== undefined) payload.stage = patch.stage;
  if (patch.state !== undefined) payload.state = patch.state;
  if (patch.paymentStatus !== undefined)
    payload.payment_status = patch.paymentStatus;
  if (patch.amountPaid !== undefined) payload.amount_paid = patch.amountPaid;
  if (patch.code !== undefined) payload.code = patch.code.trim();
  if (patch.name !== undefined) payload.customer_name = patch.name.trim();
  if (patch.commissionType !== undefined)
    payload.commission_type = patch.commissionType;
  if (patch.characterCount !== undefined)
    payload.character_count = patch.characterCount;
  if (patch.dimensions !== undefined)
    payload.dimensions = patch.dimensions.trim() || null;
  if (patch.note !== undefined) payload.note = patch.note.trim() || null;
  if (patch.contact !== undefined) payload.contact = patch.contact.trim() || null;
  if (patch.resumeExpectedAt !== undefined)
    payload.resume_expected_at = patch.resumeExpectedAt;

  return unwrapOne(
    await db
      .from("queue_entries")
      .update(payload)
      .eq("id", id)
      .select(ENTRY_COLUMNS)
      .single(),
  );
}

/**
 * Moves an entry to another lot.
 *
 * The insert trigger does not run on update, so the free queue number is found
 * here. `unique (lot_number, queue_number)` still backs it up: if two moves
 * race, the loser gets a duplicate-key error instead of a shared number.
 */
export async function moveQueueEntry(
  db: Db,
  id: string,
  toLotNumber: number,
): Promise<QueueEntryRow> {
  const lot = unwrapOne(
    await db
      .from("lots")
      .select("lot_number, capacity")
      .eq("lot_number", toLotNumber)
      .single(),
  );

  const taken = unwrap(
    await db
      .from("queue_entries")
      .select("queue_number")
      .eq("lot_number", toLotNumber)
      .neq("id", id),
  );

  const used = new Set(taken.map((row) => row.queue_number));
  let queueNumber: number | null = null;
  for (let n = 1; n <= lot.capacity; n += 1) {
    if (!used.has(n)) {
      queueNumber = n;
      break;
    }
  }
  if (queueNumber === null) {
    throw new Error("ล็อตปลายทางเต็มแล้ว");
  }

  return unwrapOne(
    await db
      .from("queue_entries")
      .update({ lot_number: toLotNumber, queue_number: queueNumber })
      .eq("id", id)
      .select(ENTRY_COLUMNS)
      .single(),
  );
}

/** Cascades to sketches, quotations and activity logs per the schema. */
export async function deleteQueueEntry(db: Db, id: string): Promise<void> {
  const { error } = await db.from("queue_entries").delete().eq("id", id);
  if (error) throw error;
}

export async function deleteQueueEntriesInLot(
  db: Db,
  lotNumber: number,
): Promise<void> {
  const { error } = await db
    .from("queue_entries")
    .delete()
    .eq("lot_number", lotNumber);
  if (error) throw error;
}

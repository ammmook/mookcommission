/**
 * Everything the customer side is allowed to call.
 *
 * `queue_entries`, `sketches` and `quotations` are revoked from `anon`; the
 * only public surface is these three `security definer` functions. Nothing in
 * this file selects from a table directly, and no customer-facing code should
 * either.
 *
 * Both RPCs that return queues filter on `lot_status = 'open'`, so a customer
 * whose lot has been closed genuinely gets "ไม่พบคิว" — that is the schema's
 * decision, not a bug in the lookup.
 */

import type { Db } from "./db";
import { unwrap } from "./db";
import { lotFromPublicQueue, mapPublicQueue, mapQuotation, mapSketch } from "./map";
import { sketchUrl } from "./sketches";
import type { QueueDetailPayload } from "./database.types";
import type { Customer, Lot, Quotation } from "@/lib/types";

export interface ActiveLot {
  lotNumber: number;
  capacity: number;
  totalEntries: number;
}

/** Powers the "Lot 03 กำลังเปิดรับ · 7/10 คิว" pill on the landing page. */
export async function getActiveLot(db: Db): Promise<ActiveLot | null> {
  const rows = unwrap(await db.rpc("get_active_lot"));
  const row = rows?.[0];
  if (!row) return null;

  return {
    lotNumber: row.lot_number,
    capacity: row.capacity,
    totalEntries: Number(row.total_entries ?? 0),
  };
}

/** Exact match on code or name, as the RPC defines it — not a fuzzy search. */
export async function findQueue(db: Db, keyword: string): Promise<Customer[]> {
  const trimmed = keyword.trim();
  if (!trimmed) return [];

  const rows = unwrap(await db.rpc("find_queue", { p_keyword: trimmed }));
  return (rows ?? []).map((row) => mapPublicQueue(row));
}

export interface QueueDetail {
  customer: Customer;
  lot: Lot;
  /** Present only when a quotation exists and has been issued. */
  quotation: Quotation | null;
  /** Active, unfinished queues in front of this one. */
  queuesAhead: number;
  /** Derived so the hero's dots and "N/M DONE" agree with the lot's progress. */
  doneCount: number;
}

export async function getQueueDetail(
  db: Db,
  code: string,
): Promise<QueueDetail | null> {
  const payload = unwrap(
    await db.rpc("get_queue_detail", { p_code: code.trim() }),
  ) as QueueDetailPayload | null;

  // The function returns no row (null) when the code is unknown or its lot is
  // closed; it can also return an object whose `queue` is null for the same
  // reason, depending on how Postgres folds the empty select.
  if (!payload?.queue) return null;

  const sketches = (payload.sketches ?? []).map((row) =>
    mapSketch(row, sketchUrl(db, row.storage_path)),
  );

  const quotation = payload.quotation
    ? mapQuotation(
        {
          id: `issued-${payload.queue.id}`,
          entry_id: payload.queue.id,
          doc_number: payload.quotation.doc_number,
          // The RPC only ever returns issued quotations.
          status: "issued",
          discount: Number(payload.quotation.discount ?? 0),
          terms: payload.quotation.terms,
          issued_at: payload.quotation.issued_at,
          created_at: payload.queue.updated_at,
          updated_at: payload.queue.updated_at,
        },
        payload.quotation.items ?? [],
      )
    : null;

  return {
    customer: mapPublicQueue(payload.queue, { sketches, quotation }),
    lot: lotFromPublicQueue(payload.queue),
    quotation,
    queuesAhead: Number(payload.queue.queues_ahead ?? 0),
    doneCount: Number(payload.queue.done_count ?? 0),
  };
}

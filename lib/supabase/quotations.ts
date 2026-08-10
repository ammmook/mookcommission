/**
 * `quotations` + `quotation_items`.
 *
 * Two schema facts shape this file:
 *  - `quotation_items.amount` is a generated column (`qty * unit_price`), so it
 *    is never sent; the database computes it.
 *  - `quotations.entry_id` is unique, so a customer has at most one quotation.
 *    Saving twice updates rather than inserts.
 */

import type { Db } from "./db";
import { unwrap } from "./db";
import { mapQuotation } from "./map";
import type { QuotationItemRow, QuotationRow } from "./database.types";
import type { Quotation, QuotationLine } from "@/lib/types";

const QUOTATION_COLUMNS =
  "id, entry_id, doc_number, status, discount, terms, issued_at, created_at, updated_at";
const ITEM_COLUMNS = "id, quotation_id, title, qty, unit_price, amount, sort_order";

async function itemsFor(db: Db, quotationId: string): Promise<QuotationItemRow[]> {
  return unwrap(
    await db
      .from("quotation_items")
      .select(ITEM_COLUMNS)
      .eq("quotation_id", quotationId)
      .order("sort_order", { ascending: true }),
  );
}

export async function getQuotationByEntry(
  db: Db,
  entryId: string,
): Promise<Quotation | null> {
  const row = unwrap(
    await db
      .from("quotations")
      .select(QUOTATION_COLUMNS)
      .eq("entry_id", entryId)
      .maybeSingle(),
  ) as QuotationRow | null;

  if (!row) return null;
  return mapQuotation(row, await itemsFor(db, row.id));
}

/** One round trip for the customer list, keyed by `entry_id`. */
export async function listQuotationsByEntries(
  db: Db,
  entryIds: string[],
): Promise<Map<string, Quotation>> {
  const byEntry = new Map<string, Quotation>();
  if (entryIds.length === 0) return byEntry;

  const rows = unwrap(
    await db.from("quotations").select(QUOTATION_COLUMNS).in("entry_id", entryIds),
  );
  if (rows.length === 0) return byEntry;

  const items = unwrap(
    await db
      .from("quotation_items")
      .select(ITEM_COLUMNS)
      .in(
        "quotation_id",
        rows.map((row) => row.id),
      )
      .order("sort_order", { ascending: true }),
  );

  const itemsByQuotation = new Map<string, QuotationItemRow[]>();
  for (const item of items) {
    const list = itemsByQuotation.get(item.quotation_id) ?? [];
    list.push(item);
    itemsByQuotation.set(item.quotation_id, list);
  }

  for (const row of rows) {
    byEntry.set(
      row.entry_id,
      mapQuotation(row, itemsByQuotation.get(row.id) ?? []),
    );
  }
  return byEntry;
}

/**
 * "QT-2569-014" — Buddhist-era year plus a running number within that year.
 * `doc_number` is unique, so a collision under concurrent issuing surfaces as
 * the "เลขที่ใบเสนอราคาซ้ำ" message rather than a corrupt document.
 */
export async function nextDocNumber(db: Db): Promise<string> {
  const year = new Date().getFullYear() + 543;
  const prefix = `QT-${year}-`;

  const rows = unwrap(
    await db
      .from("quotations")
      .select("doc_number")
      .like("doc_number", `${prefix}%`)
      .order("doc_number", { ascending: false })
      .limit(1),
  );

  const last = rows[0]?.doc_number;
  const lastSeq = last ? Number.parseInt(last.slice(prefix.length), 10) : 0;
  const next = Number.isFinite(lastSeq) ? lastSeq + 1 : 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export interface SaveQuotationInput {
  entryId: string;
  lines: QuotationLine[];
  terms: string;
  discount: number;
}

/**
 * Saves the draft, creating the quotation on first save.
 *
 * Items are replaced wholesale rather than diffed: the builder lets the artist
 * add, remove and reorder freely, and a delete-then-insert keeps `sort_order`
 * matching what is on screen without tracking per-row identity.
 */
export async function saveQuotationDraft(
  db: Db,
  input: SaveQuotationInput,
): Promise<Quotation> {
  const existing = unwrap(
    await db
      .from("quotations")
      .select(QUOTATION_COLUMNS)
      .eq("entry_id", input.entryId)
      .maybeSingle(),
  ) as QuotationRow | null;

  if (existing?.status === "issued") {
    throw new Error("ใบเสนอราคานี้ออกให้ลูกค้าแล้ว จึงแก้ไขไม่ได้");
  }

  const quotation =
    existing ??
    (unwrap(
      await db
        .from("quotations")
        .insert({
          entry_id: input.entryId,
          doc_number: await nextDocNumber(db),
          status: "draft",
          discount: input.discount,
          terms: input.terms,
        })
        .select(QUOTATION_COLUMNS)
        .single(),
    ) as QuotationRow);

  if (existing) {
    const { error } = await db
      .from("quotations")
      .update({ discount: input.discount, terms: input.terms })
      .eq("id", quotation.id);
    if (error) throw error;
  }

  await replaceItems(db, quotation.id, input.lines);

  const refreshed = unwrap(
    await db
      .from("quotations")
      .select(QUOTATION_COLUMNS)
      .eq("id", quotation.id)
      .single(),
  ) as QuotationRow;

  return mapQuotation(refreshed, await itemsFor(db, quotation.id));
}

async function replaceItems(
  db: Db,
  quotationId: string,
  lines: QuotationLine[],
): Promise<void> {
  const { error: clearError } = await db
    .from("quotation_items")
    .delete()
    .eq("quotation_id", quotationId);
  if (clearError) throw clearError;

  // Blank rows are the builder's "empty line" affordance, not real items.
  const payload = lines
    .filter((line) => line.item.trim() !== "")
    .map((line, index) => ({
      quotation_id: quotationId,
      title: line.item.trim(),
      qty: line.qty,
      unit_price: line.price,
      sort_order: index,
      // `amount` is generated by the database — deliberately not sent.
    }));

  if (payload.length === 0) return;

  const { error } = await db.from("quotation_items").insert(payload);
  if (error) throw error;
}

/**
 * Saves any last edits, then flips the quotation to `issued`. Only then does
 * `get_queue_detail()` expose it to the customer.
 */
export async function issueQuotation(
  db: Db,
  input: SaveQuotationInput,
): Promise<Quotation> {
  const draft = await saveQuotationDraft(db, input);

  if (draft.lines.length === 0) {
    throw new Error("เพิ่มรายการอย่างน้อย 1 รายการก่อนออกใบเสนอราคา");
  }

  const row = unwrap(
    await db
      .from("quotations")
      .update({ status: "issued", issued_at: new Date().toISOString() })
      .eq("id", draft.id)
      .eq("status", "draft")
      .select(QUOTATION_COLUMNS)
      .single(),
  ) as QuotationRow;

  return mapQuotation(row, await itemsFor(db, row.id));
}

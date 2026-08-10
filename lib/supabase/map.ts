/**
 * The one place where database rows become UI objects.
 *
 * Keeping every translation here means the schema can use `lot_number` /
 * 'open' / `amount_paid` while the components keep using `lot.id` / "active" /
 * `customer.amount`, and neither side has to bend to the other.
 */

import {
  monoDate,
  parseTimestamp,
  thaiDate,
  thaiDayMonth,
} from "@/lib/format";
import type {
  Customer,
  HistoryEntry,
  Lot,
  LotProgress,
  Quotation,
  QuotationLine,
  SiteSettings,
  Sketch,
  Stage,
  StageEvent,
} from "@/lib/types";
import type {
  ActivityLogRow,
  DbWorkStage,
  LotProgressRow,
  LotRow,
  QuotationItemRow,
  QuotationRow,
  QueueEntryRow,
  QueuePublicRow,
  SiteSettingsRow,
  SketchRow,
} from "./database.types";

/** The bucket every sketch lives in; it is public, so URLs are predictable. */
export const SKETCH_BUCKET = "sketches";

// ---------- lots ----------

/** "คิว 01–10" — derived, since the schema stores only a capacity. */
export function queueRangeLabel(capacity: number): string {
  return `คิว 01–${String(capacity).padStart(2, "0")}`;
}

export function mapLot(row: LotRow): Lot {
  const opened = parseTimestamp(row.opened_at);
  const closed = parseTimestamp(row.closed_at);
  const isOpen = row.status === "open";

  return {
    id: String(row.lot_number),
    number: row.lot_number,
    // 'open' in Postgres reads as "active" throughout the UI.
    status: isOpen ? "active" : "closed",
    capacity: row.capacity,
    queueRange: queueRangeLabel(row.capacity),
    dateLabel: isOpen
      ? `เปิด ${opened ? thaiDate(opened) : "—"}`
      : `ปิด ${closed ? thaiDate(closed) : opened ? thaiDate(opened) : "—"}`,
  };
}

export function mapLotProgress(row: LotProgressRow): LotProgress {
  return {
    lotNumber: row.lot_number,
    capacity: row.capacity,
    totalEntries: Number(row.total_entries ?? 0),
    doneCount: Number(row.done_count ?? 0),
    currentQueueNumber: row.current_queue_number,
  };
}

// ---------- sketches ----------

export function mapSketch(row: SketchRow, publicUrl: string): Sketch {
  return {
    id: row.id,
    label: row.label ?? "SKETCH",
    storagePath: row.storage_path,
    url: publicUrl,
  };
}

// ---------- activity ----------

const STAGE_VALUES: Stage[] = [
  "waiting",
  "sketch",
  "payment",
  "coloring",
  "completed",
];

function isStage(value: string): value is Stage {
  return (STAGE_VALUES as string[]).includes(value);
}

const STAGE_TH: Record<Stage, string> = {
  waiting: "รอคิว",
  sketch: "ร่างภาพ",
  payment: "ชำระเงิน",
  coloring: "กำลังลงสี",
  completed: "เสร็จสิ้น",
};

/** The trigger writes `detail` as "old -> new"; this pulls out the new value. */
function stageFromDetail(detail: string | null): Stage | null {
  const next = detail?.split("->").pop()?.trim();
  return next && isStage(next) ? next : null;
}

/**
 * Turns one `activity_logs` row into the history bullet the editor renders.
 * The database writes these via trigger — the frontend only ever reads them.
 */
export function mapActivity(row: ActivityLogRow): HistoryEntry {
  const created = parseTimestamp(row.created_at);
  const dateLabel = created ? monoDate(created) : "";
  const detail = row.detail?.trim() ?? "";

  switch (row.action) {
    case "stage_changed": {
      const stage = stageFromDetail(row.detail);
      return {
        id: row.id,
        label: stage
          ? `เปลี่ยนเป็น “${STAGE_TH[stage]}”`
          : "เปลี่ยนขั้นตอนงาน",
        dateLabel,
        tone: stage === "completed" ? "teal" : "violet",
      };
    }
    case "state_changed": {
      const next = row.detail?.split("->").pop()?.trim();
      if (next === "paused") {
        return { id: row.id, label: "หยุดคิวชั่วคราว", dateLabel, tone: "amber" };
      }
      if (next === "cancelled") {
        return { id: row.id, label: "ยกเลิกงาน", dateLabel, tone: "coral" };
      }
      return {
        id: row.id,
        label: "กลับมาดำเนินการ",
        dateLabel,
        tone: "teal",
      };
    }
    case "payment_received": {
      const paid = Number(detail);
      return {
        id: row.id,
        label: Number.isFinite(paid) && detail !== ""
          ? `รับชำระเงิน ฿${paid.toLocaleString("th-TH")}`
          : "รับชำระเงิน",
        dateLabel,
        tone: "teal",
      };
    }
    default:
      return {
        id: row.id,
        label: detail || row.action,
        dateLabel,
        tone: "amber",
      };
  }
}

/** Stage timeline for the customer stepper, rebuilt from the same log rows. */
export function stageHistoryFromActivity(rows: ActivityLogRow[]): StageEvent[] {
  const seen = new Map<Stage, string>();

  // Oldest first, so the earliest arrival at each stage wins.
  for (const row of [...rows].reverse()) {
    if (row.action !== "stage_changed") continue;
    const stage = stageFromDetail(row.detail);
    if (!stage || seen.has(stage)) continue;
    const created = parseTimestamp(row.created_at);
    seen.set(stage, created ? thaiDayMonth(created) : "");
  }

  return [...seen.entries()].map(([stage, dateLabel]) => ({
    stage,
    dateLabel,
  }));
}

// ---------- quotations ----------

export function mapQuotationItem(row: QuotationItemRow): QuotationLine {
  return {
    id: row.id,
    item: row.title,
    qty: row.qty,
    price: Number(row.unit_price),
  };
}

export function mapQuotation(
  row: QuotationRow,
  items: QuotationItemRow[],
): Quotation {
  const issued = parseTimestamp(row.issued_at);
  return {
    id: row.id,
    number: row.doc_number,
    customerId: row.entry_id,
    status: row.status,
    issuedLabel: issued ? monoDate(issued) : undefined,
    lines: items.map(mapQuotationItem),
    discount: Number(row.discount ?? 0),
    terms: row.terms ?? "",
  };
}

/** Line items minus the discount — the figure the UI calls `amount`. */
export function quotationTotal(quotation: Quotation): number {
  const sub = quotation.lines.reduce(
    (sum, line) => sum + line.qty * line.price,
    0,
  );
  return Math.max(0, sub - quotation.discount);
}

// ---------- queue entries ----------

/** "หยุดตั้งแต่ 2 ส.ค. 2569 · คาดว่ากลับมา 12 ส.ค." */
function pausedNote(
  pausedAt: string | null,
  resumeExpectedAt: string | null,
): string | undefined {
  const paused = parseTimestamp(pausedAt);
  if (!paused) return undefined;
  const resume = parseTimestamp(resumeExpectedAt);
  const base = `หยุดตั้งแต่ ${thaiDate(paused)}`;
  return resume ? `${base} · คาดว่ากลับมา ${thaiDayMonth(resume)}` : base;
}

export interface QueueEntryExtras {
  sketches?: Sketch[];
  activity?: ActivityLogRow[];
  quotation?: Quotation | null;
}

/**
 * The admin-side mapping: a full `queue_entries` row plus whatever related
 * data the caller managed to fetch alongside it.
 */
export function mapQueueEntry(
  row: QueueEntryRow,
  extras: QueueEntryExtras = {},
): Customer {
  const { sketches = [], activity = [], quotation = null } = extras;
  const paidAt = parseTimestamp(row.paid_at);
  const updatedAt = parseTimestamp(row.updated_at);

  return {
    id: row.id,
    code: row.code,
    name: row.customer_name,
    queueNumber: row.queue_number,
    lotId: String(row.lot_number),
    stage: row.stage,
    state: row.state,
    payment: row.payment_status,
    amount: resolveAmount(row.amount_paid, quotation),
    paidDateLabel: paidAt ? thaiDate(paidAt) : undefined,
    contact: row.contact,
    commission: {
      type: row.commission_type ?? "—",
      characters: row.character_count,
      dimensions: row.dimensions ?? "—",
      note: row.note?.trim() || "—",
    },
    sketches,
    history: activity.map(mapActivity),
    stageHistory: stageHistoryFromActivity(activity),
    quotationId: quotation?.id ?? null,
    quotation,
    pausedNote:
      row.state === "paused"
        ? pausedNote(row.paused_at, row.resume_expected_at)
        : undefined,
    updatedLabel: updatedAt ? thaiDate(updatedAt) : "—",
  };
}

/**
 * The public mapping, built from `queue_public` (what `find_queue` and
 * `get_queue_detail` return). It carries less than the admin row by design —
 * no contact details, no draft quotation, no activity log.
 */
export function mapPublicQueue(
  row: QueuePublicRow,
  extras: QueueEntryExtras = {},
): Customer {
  const { sketches = [], quotation = null } = extras;
  const paidAt = parseTimestamp(row.paid_at);
  const updatedAt = parseTimestamp(row.updated_at);

  return {
    id: row.id,
    code: row.code,
    name: row.customer_name,
    queueNumber: row.queue_number,
    lotId: String(row.lot_number),
    stage: row.stage,
    state: row.state,
    payment: row.payment_status,
    amount: resolveAmount(row.amount_paid, quotation),
    paidDateLabel: paidAt ? thaiDate(paidAt) : undefined,
    contact: null,
    commission: {
      type: row.commission_type ?? "—",
      characters: row.character_count,
      dimensions: row.dimensions ?? "—",
      note: row.note?.trim() || "—",
    },
    sketches,
    history: [],
    stageHistory: [],
    quotationId: quotation?.id ?? null,
    quotation,
    pausedNote:
      row.state === "paused"
        ? pausedNote(row.paused_at, row.resume_expected_at)
        : undefined,
    updatedLabel: updatedAt ? thaiDate(updatedAt) : "—",
  };
}

/**
 * What the payment card shows: the settled amount once money has arrived,
 * otherwise the quotation total so "รอชำระเงิน ฿2,400" has a number to show.
 */
function resolveAmount(
  amountPaid: number | null,
  quotation: Quotation | null,
): number | null {
  if (amountPaid !== null && amountPaid !== undefined) return Number(amountPaid);
  if (quotation) return quotationTotal(quotation);
  return null;
}

/**
 * The lot a `queue_public` row belongs to. The RPC flattens capacity and status
 * into the row, so a full `lots` fetch is unnecessary on the customer side.
 */
export function lotFromPublicQueue(row: QueuePublicRow): Lot {
  return {
    id: String(row.lot_number),
    number: row.lot_number,
    status: row.lot_status === "open" ? "active" : "closed",
    capacity: row.capacity,
    queueRange: queueRangeLabel(row.capacity),
    dateLabel: row.lot_status === "open" ? "กำลังเปิดรับ" : "ปิดแล้ว",
  };
}

// ---------- settings ----------

export function mapSettings(row: SiteSettingsRow): SiteSettings {
  return {
    studioName: row.studio_name,
    contactHandle: row.contact_handle,
  };
}

/** Re-exported so callers can narrow without importing the db types module. */
export type { DbWorkStage };

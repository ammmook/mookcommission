/**
 * Domain types for TorQueue — the vocabulary the UI speaks.
 *
 * These are *not* the database's row shapes: `lib/supabase/database.types.ts`
 * holds those, and `lib/supabase/map.ts` translates between the two. Where the
 * names differ (`Lot.status` is "active" here but `lot_status` is 'open' in
 * Postgres) the comment says so.
 */

/**
 * The six stages a commission moves through, in order:
 * รอคิว → จ่ายมัดจำ → ร่างภาพ → กำลังลงสี → ชำระเงิน → เสร็จสิ้น.
 *
 * `deposit` is the up-front payment and `payment` the balance at the end; both
 * read `payment_status`, which still tracks settlement as a single flag.
 */
export type Stage =
  | "waiting"
  | "deposit"
  | "sketch"
  | "coloring"
  | "payment"
  | "completed";

/** Lifecycle state that sits alongside the stage. */
export type QueueState = "active" | "paused" | "cancelled";

export type PaymentStatus = "paid" | "unpaid";

/** Maps to the `lot_status` enum, whose open state is spelled 'open'. */
export type LotStatus = "active" | "closed";

export interface Lot {
  /** `String(lot_number)` — lots have no surrogate key in the database. */
  id: string;
  /** Display number, e.g. 3 renders as "Lot 03". Also the primary key. */
  number: number;
  status: LotStatus;
  capacity: number;
  queueRange: string;
  /** Pre-rendered Thai date, e.g. "เปิด 1 ส.ค. 2569". */
  dateLabel: string;
}

/** A row of the `lot_progress` view, used for dashboard counts. */
export interface LotProgress {
  lotNumber: number;
  capacity: number;
  totalEntries: number;
  doneCount: number;
  /** Queue the artist is on right now, or null when the lot is done/empty. */
  currentQueueNumber: number | null;
}

export interface StageEvent {
  stage: Stage;
  dateLabel: string;
}

export interface Sketch {
  id: string;
  label: string;
  /** Path inside the `sketches` storage bucket. */
  storagePath: string;
  /** Public URL for that path, resolved at map time. */
  url: string;
}

export interface Customer {
  id: string;
  /** Public lookup code, e.g. "MK001". Format is `^[A-Z]{2}[0-9]{3}$`. */
  code: string;
  name: string;
  queueNumber: number;
  lotId: string;
  stage: Stage;
  state: QueueState;
  payment: PaymentStatus;
  /**
   * Amount in THB: what was paid once settled, otherwise the quotation total.
   * Null when nothing has been quoted yet.
   */
  amount: number | null;
  paidDateLabel?: string;
  /** IG / Discord / phone. */
  contact: string | null;
  /**
   * Admin-only: `email` is not part of the `queue_public` view, so it never
   * reaches a customer-facing page.
   */
  email: string | null;
  commission: CommissionSpec;
  sketches: Sketch[];
  history: HistoryEntry[];
  stageHistory: StageEvent[];
  quotationId: string | null;
  /**
   * The customer's quotation, loaded alongside the entry. On the customer side
   * this is only ever an issued one — `get_queue_detail()` filters drafts out.
   */
  quotation: Quotation | null;
  /** Only set when `state` is "paused". */
  pausedNote?: string;
  updatedLabel: string;
}

export interface CommissionSpec {
  type: string;
  characters: number;
  dimensions: string;
  note: string;
}

export interface HistoryEntry {
  id: string;
  label: string;
  dateLabel: string;
  tone: "violet" | "teal" | "amber" | "coral";
}

export interface QuotationLine {
  id: string;
  item: string;
  qty: number;
  price: number;
}

export type QuotationStatus = "draft" | "issued";

export interface Quotation {
  id: string;
  /** `doc_number`, e.g. "QT-2569-014". */
  number: string;
  /** The owning `queue_entries.id`. */
  customerId: string;
  status: QuotationStatus;
  issuedLabel?: string;
  lines: QuotationLine[];
  discount: number;
  terms: string;
}

/** The single `site_settings` row. */
export interface SiteSettings {
  studioName: string;
  contactHandle: string | null;
}

/** A dashboard item that needs the artist's attention. */
export interface ActionItem {
  id: string;
  tone: "amber" | "violet" | "coral";
  label: string;
  shortLabel: string;
  actionLabel: string;
  href: string;
}

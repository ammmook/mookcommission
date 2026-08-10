/**
 * Domain types for TorQueue.
 *
 * These are shaped the way a Supabase row would be (flat, id-referenced) so the
 * mock data in `data/` can be swapped for real queries without touching the UI.
 */

/** The five stages a commission moves through, in order. */
export type Stage =
  | "waiting"
  | "sketch"
  | "payment"
  | "coloring"
  | "completed";

/** Lifecycle state that sits alongside the stage. */
export type QueueState = "active" | "paused" | "cancelled";

export type PaymentStatus = "paid" | "unpaid";

export type LotStatus = "active" | "closed";

export interface Lot {
  id: string;
  /** Display number, e.g. 3 renders as "Lot 03". */
  number: number;
  status: LotStatus;
  capacity: number;
  queueRange: string;
  /** Thai-formatted date string, pre-rendered to keep mock data simple. */
  dateLabel: string;
}

export interface StageEvent {
  stage: Stage;
  dateLabel: string;
}

export interface Sketch {
  id: string;
  label: string;
}

export interface Customer {
  id: string;
  /** Public lookup code, e.g. "MK001". */
  code: string;
  name: string;
  queueNumber: number;
  lotId: string;
  stage: Stage;
  state: QueueState;
  payment: PaymentStatus;
  /** Amount in THB. Null when nothing has been quoted yet. */
  amount: number | null;
  paidDateLabel?: string;
  commission: CommissionSpec;
  sketches: Sketch[];
  history: HistoryEntry[];
  stageHistory: StageEvent[];
  quotationId: string | null;
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

export interface Quotation {
  id: string;
  /** Document number, e.g. "QT-2569-014". */
  number: string;
  customerId: string;
  status: "draft" | "issued";
  issuedLabel?: string;
  lines: QuotationLine[];
  discount: number;
  terms: string;
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

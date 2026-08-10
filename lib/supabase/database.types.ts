/**
 * Types for the TorQueue Supabase schema.
 *
 * Hand-written to mirror `schema/torqueue_schema.sql` exactly — table and
 * column names here are the database's, not the UI's. `lib/supabase/map.ts`
 * is the only place that translates between the two vocabularies.
 *
 * If the SQL changes, regenerate with:
 *   npx supabase gen types typescript --project-id <ref> > lib/supabase/database.types.ts
 */

// ---------- enums ----------

/** `lot_status` — note this is 'open'/'closed', while the UI says 'active'/'closed'. */
export type DbLotStatus = "open" | "closed";
export type DbWorkStage =
  | "waiting"
  | "sketch"
  | "payment"
  | "coloring"
  | "completed";
export type DbQueueState = "active" | "paused" | "cancelled";
export type DbPaymentStatus = "unpaid" | "paid";
export type DbQuotationStatus = "draft" | "issued";

// ---------- rows ----------

export type AdminRow = {
  id: string;
  display_name: string;
  created_at: string;
}

export type LotRow = {
  /** Primary key — lots have no surrogate id. */
  lot_number: number;
  capacity: number;
  status: DbLotStatus;
  opened_at: string;
  closed_at: string | null;
  note: string | null;
}

export type QueueEntryRow = {
  id: string;
  lot_number: number;
  queue_number: number;
  code: string;
  customer_name: string;
  contact: string | null;
  /** Added by migration 003. Admin-only — deliberately absent from queue_public. */
  email: string | null;
  commission_type: string | null;
  character_count: number;
  dimensions: string | null;
  note: string | null;
  stage: DbWorkStage;
  state: DbQueueState;
  paused_at: string | null;
  /** `date`, not `timestamptz` — serialises as "2026-08-12". */
  resume_expected_at: string | null;
  cancelled_at: string | null;
  payment_status: DbPaymentStatus;
  /** `numeric` comes back as a number through PostgREST. */
  amount_paid: number | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SketchRow = {
  id: string;
  entry_id: string;
  storage_path: string;
  label: string | null;
  sort_order: number;
  created_at: string;
}

export type QuotationRow = {
  id: string;
  entry_id: string;
  doc_number: string;
  status: DbQuotationStatus;
  discount: number;
  terms: string | null;
  issued_at: string | null;
  created_at: string;
  updated_at: string;
}

export type QuotationItemRow = {
  id: string;
  quotation_id: string;
  title: string;
  qty: number;
  unit_price: number;
  /** Generated column (`qty * unit_price`) — never send this on insert/update. */
  amount: number;
  sort_order: number;
}

export type ActivityLogRow = {
  id: string;
  entry_id: string;
  action: string;
  detail: string | null;
  actor_id: string | null;
  created_at: string;
}

/** Added by migration 002. */
export type CommissionTypeRow = {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export type SiteSettingsRow = {
  /** Always `true` — the table is constrained to a single row. */
  id: boolean;
  studio_name: string;
  contact_handle: string | null;
  updated_at: string;
}

// ---------- views ----------

export type LotProgressRow = {
  lot_number: number;
  capacity: number;
  status: DbLotStatus;
  opened_at: string;
  closed_at: string | null;
  total_entries: number;
  done_count: number;
  /** Lowest active, unfinished queue number — null when the lot is done/empty. */
  current_queue_number: number | null;
}

/** `queue_public` — the shape `find_queue()` returns rows of. */
export type QueuePublicRow = {
  id: string;
  code: string;
  customer_name: string;
  lot_number: number;
  queue_number: number;
  stage: DbWorkStage;
  state: DbQueueState;
  paused_at: string | null;
  resume_expected_at: string | null;
  commission_type: string | null;
  character_count: number;
  dimensions: string | null;
  note: string | null;
  payment_status: DbPaymentStatus;
  amount_paid: number | null;
  paid_at: string | null;
  updated_at: string;
  capacity: number;
  done_count: number;
  lot_status: DbLotStatus;
  queues_ahead: number;
}

// ---------- RPC payloads ----------

/** `get_active_lot()` returns a table, so PostgREST gives an array of these. */
export type ActiveLotRow = {
  lot_number: number;
  capacity: number;
  total_entries: number;
}

/**
 * `get_queue_detail(code)` returns one jsonb object. `quotation` is null unless
 * a quotation exists **and** its status is 'issued' — drafts never reach here.
 */
export type QueueDetailPayload = {
  queue: QueuePublicRow;
  sketches: SketchRow[];
  quotation: {
    doc_number: string;
    issued_at: string | null;
    discount: number;
    terms: string | null;
    items: QuotationItemRow[];
  } | null;
}

// ---------- client generic ----------

/**
 * `Database` generic for `createBrowserClient`/`createServerClient`.
 *
 * The structure (including the empty `Relationships` arrays) is what
 * postgrest-js's `GenericSchema` requires — without them every `.from()` call
 * degrades to `never`. `Relationships` stays empty because nothing in this app
 * uses PostgREST's embedded-resource syntax; joins are done with explicit
 * queries in `lib/supabase/`.
 */
export type Database = {
  public: {
    Tables: {
      admins: {
        Row: AdminRow;
        Insert: Partial<AdminRow> & { id: string };
        Update: Partial<AdminRow>;
        Relationships: [];
      };
      lots: {
        Row: LotRow;
        Insert: { lot_number: number } & Partial<Omit<LotRow, "lot_number">>;
        Update: Partial<LotRow>;
        Relationships: [];
      };
      queue_entries: {
        Row: QueueEntryRow;
        Insert: Pick<QueueEntryRow, "lot_number" | "code" | "customer_name"> &
          Partial<Omit<QueueEntryRow, "lot_number" | "code" | "customer_name">>;
        Update: Partial<QueueEntryRow>;
        Relationships: [];
      };
      sketches: {
        Row: SketchRow;
        Insert: Pick<SketchRow, "entry_id" | "storage_path"> &
          Partial<Omit<SketchRow, "entry_id" | "storage_path">>;
        Update: Partial<SketchRow>;
        Relationships: [];
      };
      quotations: {
        Row: QuotationRow;
        Insert: Pick<QuotationRow, "entry_id" | "doc_number"> &
          Partial<Omit<QuotationRow, "entry_id" | "doc_number">>;
        Update: Partial<QuotationRow>;
        Relationships: [];
      };
      quotation_items: {
        Row: QuotationItemRow;
        // `amount` is generated — deliberately absent from Insert/Update.
        Insert: Pick<QuotationItemRow, "quotation_id" | "title"> &
          Partial<Pick<QuotationItemRow, "qty" | "unit_price" | "sort_order">>;
        Update: Partial<
          Pick<QuotationItemRow, "title" | "qty" | "unit_price" | "sort_order">
        >;
        Relationships: [];
      };
      activity_logs: {
        Row: ActivityLogRow;
        Insert: Pick<ActivityLogRow, "entry_id" | "action"> &
          Partial<ActivityLogRow>;
        Update: Partial<ActivityLogRow>;
        Relationships: [];
      };
      site_settings: {
        Row: SiteSettingsRow;
        Insert: Partial<SiteSettingsRow>;
        Update: Partial<SiteSettingsRow>;
        Relationships: [];
      };
      commission_types: {
        Row: CommissionTypeRow;
        Insert: Pick<CommissionTypeRow, "name"> &
          Partial<Omit<CommissionTypeRow, "name">>;
        Update: Partial<CommissionTypeRow>;
        Relationships: [];
      };
    };
    Views: {
      lot_progress: { Row: LotProgressRow; Relationships: [] };
      queue_public: { Row: QueuePublicRow; Relationships: [] };
    };
    Functions: {
      // `Record<PropertyKey, never>` is how a no-argument function is spelled;
      // it lets `.rpc("get_active_lot")` be called without a second argument.
      get_active_lot: {
        Args: Record<PropertyKey, never>;
        Returns: ActiveLotRow[];
      };
      find_queue: { Args: { p_keyword: string }; Returns: QueuePublicRow[] };
      get_queue_detail: {
        Args: { p_code: string };
        Returns: QueueDetailPayload | null;
      };
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
      // Added by migration 003 so customers can read the studio name and
      // contact handle without `site_settings` itself being readable.
      get_site_settings: {
        Args: Record<PropertyKey, never>;
        Returns: { studio_name: string; contact_handle: string | null }[];
      };
    };
    Enums: {
      lot_status: DbLotStatus;
      work_stage: DbWorkStage;
      queue_state: DbQueueState;
      payment_status: DbPaymentStatus;
      quotation_status: DbQuotationStatus;
    };
    CompositeTypes: Record<string, never>;
  };
}

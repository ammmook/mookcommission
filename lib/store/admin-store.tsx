"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import {
  DEFAULT_COMMISSION_TYPES,
  listCommissionTypes,
} from "@/lib/supabase/commission-types";
import { reportError } from "@/lib/supabase/errors";
import {
  createLot as createLotRow,
  deleteLot as deleteLotRow,
  listLotProgress,
  listLots,
  setLotStatus as setLotStatusRow,
  updateLotCapacity,
} from "@/lib/supabase/lots";
import {
  createQueueEntry,
  deleteQueueEntriesInLot,
  deleteQueueEntry,
  listCustomers,
  moveQueueEntry,
  updateQueueEntry,
  validateCode,
} from "@/lib/supabase/queues";
import type {
  Customer,
  Lot,
  LotProgress,
  LotStatus,
  PaymentStatus,
  QueueState,
  Stage,
} from "@/lib/types";

/** What happens to a lot's customers when the lot is deleted. */
export type DeleteLotPlan =
  | { kind: "reassign"; toLotId: string }
  | { kind: "delete-customers" };

export interface CreateLotInput {
  capacity: number;
}

/**
 * Mutations return null on success and a ready-to-render Thai message on
 * failure, so every caller can surface the real reason ("ล็อตนี้เต็มแล้ว")
 * instead of a generic one.
 */
export type MutationResult = Promise<string | null>;

/** The subset of a customer the editor can change. */
export interface CustomerPatch {
  stage?: Stage;
  state?: QueueState;
  payment?: PaymentStatus;
  name?: string;
  code?: string;
  contact?: string;
  email?: string;
  commission?: {
    type?: string;
    characters?: number;
    dimensions?: string;
    note?: string;
  };
}

interface AdminStore {
  lots: Lot[];
  customers: Customer[];
  /** The one lot still open for new queues, per the `one_open_lot` index. */
  activeLot: Lot | undefined;
  /** Display name from the `admins` row. */
  adminName: string;
  /** Options for the "ประเภทงาน" dropdowns, from `commission_types`. */
  commissionTypes: string[];

  /** True during the first load only; mutations use `busy`. */
  loading: boolean;
  /** True while a mutation is in flight. */
  busy: boolean;
  /** Set when the initial load failed. */
  loadError: string | null;

  filledFor: (lotId: string) => number;
  customersInLot: (lotId: string) => Customer[];
  /** Free slots left, used to gate moves. */
  spaceIn: (lotId: string) => number;
  getCustomer: (code: string) => Customer | undefined;
  /** `lot_progress` row for a lot — the source for "queue in progress". */
  progressFor: (lotId: string) => LotProgress | undefined;
  /** Queue number the artist is on in the active lot, or null. */
  currentQueueNumber: number | null;

  refresh: () => Promise<void>;

  createLot: (input: CreateLotInput) => MutationResult;
  updateLot: (lotId: string, patch: { capacity: number }) => MutationResult;
  setLotStatus: (lotId: string, status: LotStatus) => MutationResult;
  deleteLot: (lotId: string, plan: DeleteLotPlan) => MutationResult;

  addCustomer: (input: NewCustomerInput) => MutationResult;
  moveCustomer: (customerId: string, toLotId: string) => MutationResult;
  removeCustomer: (customerId: string) => MutationResult;
  updateCustomer: (customerId: string, patch: CustomerPatch) => MutationResult;
}

export interface NewCustomerInput {
  name: string;
  code: string;
  lotId: string;
  type: string;
  characters: number;
  note: string;
  email: string;
}

const AdminDataContext = createContext<AdminStore | null>(null);

/** Lot ids are `String(lot_number)`; this is the only place that undoes that. */
function lotNumberOf(lotId: string): number {
  return Number.parseInt(lotId, 10);
}

/**
 * Loads the admin's whole working set from Supabase and turns every action into
 * a mutation. It sits at the protected admin layout, so edits made on one
 * screen are visible on the others — the same contract the in-memory version
 * had, with a network round trip behind each call.
 *
 * Every request goes out with the signed-in admin's cookie, so RLS decides what
 * is permitted; nothing here re-implements those checks.
 */
export function AdminDataProvider({
  children,
  adminName,
}: {
  children: ReactNode;
  adminName: string;
}) {
  const [lots, setLots] = useState<Lot[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [progress, setProgress] = useState<LotProgress[]>([]);
  const [commissionTypes, setCommissionTypes] = useState<string[]>(
    DEFAULT_COMMISSION_TYPES,
  );
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const db = supabaseBrowser();
    try {
      const [nextLots, nextCustomers, nextProgress, nextTypes] =
        await Promise.all([
          listLots(db),
          listCustomers(db),
          listLotProgress(db),
          listCommissionTypes(db),
        ]);
      setLots(nextLots);
      setCustomers(nextCustomers);
      setProgress(nextProgress);
      setCommissionTypes(nextTypes);
      setLoadError(null);
    } catch (error) {
      setLoadError(reportError(error, "โหลดข้อมูลไม่สำเร็จ"));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  /**
   * Runs a mutation, then reloads.
   *
   * Refetching rather than patching local state is deliberate: queue numbers,
   * `paid_at`, `paused_at` and the whole activity log are all produced by
   * triggers, so the row that comes back from a write is the only truth — and
   * a lot close can change several rows at once.
   */
  const mutate = useCallback(
    async (action: () => Promise<void>, fallback: string): MutationResult => {
      setBusy(true);
      try {
        await action();
        await load();
        return null;
      } catch (error) {
        return reportError(error, fallback);
      } finally {
        setBusy(false);
      }
    },
    [load],
  );

  const filledFor = useCallback(
    (lotId: string) =>
      customers.filter((customer) => customer.lotId === lotId).length,
    [customers],
  );

  const customersInLot = useCallback(
    (lotId: string) =>
      customers
        .filter((customer) => customer.lotId === lotId)
        .sort((a, b) => a.queueNumber - b.queueNumber),
    [customers],
  );

  const spaceIn = useCallback(
    (lotId: string) => {
      const lot = lots.find((entry) => entry.id === lotId);
      if (!lot) return 0;
      return Math.max(0, lot.capacity - filledFor(lotId));
    },
    [lots, filledFor],
  );

  const getCustomer = useCallback(
    (code: string) =>
      customers.find(
        (customer) => customer.code.toUpperCase() === code.toUpperCase(),
      ),
    [customers],
  );

  const progressFor = useCallback(
    (lotId: string) =>
      progress.find((row) => String(row.lotNumber) === lotId),
    [progress],
  );

  const activeLot = useMemo(
    () => lots.find((lot) => lot.status === "active"),
    [lots],
  );

  const currentQueueNumber = useMemo(
    () => (activeLot ? progressFor(activeLot.id)?.currentQueueNumber ?? null : null),
    [activeLot, progressFor],
  );

  // ---------- lot mutations ----------

  const createLot = useCallback(
    (input: CreateLotInput) =>
      mutate(async () => {
        await createLotRow(supabaseBrowser(), input.capacity);
      }, "สร้างล็อตไม่สำเร็จ"),
    [mutate],
  );

  const updateLot = useCallback(
    (lotId: string, patch: { capacity: number }) =>
      mutate(async () => {
        await updateLotCapacity(supabaseBrowser(), lotNumberOf(lotId), patch.capacity);
      }, "แก้ไขล็อตไม่สำเร็จ"),
    [mutate],
  );

  const setLotStatus = useCallback(
    (lotId: string, status: LotStatus) =>
      mutate(async () => {
        await setLotStatusRow(supabaseBrowser(), lotNumberOf(lotId), status);
      }, "เปลี่ยนสถานะล็อตไม่สำเร็จ"),
    [mutate],
  );

  /**
   * `queue_entries.lot_number` is `on delete restrict`, so the lot has to be
   * emptied before it can go. The plan the modal collected decides how.
   */
  const deleteLot = useCallback(
    (lotId: string, plan: DeleteLotPlan) =>
      mutate(async () => {
        const db = supabaseBrowser();
        const lotNumber = lotNumberOf(lotId);
        const roster = customersInLot(lotId);

        if (plan.kind === "reassign") {
          const target = lotNumberOf(plan.toLotId);
          // Sequential, not parallel: each move claims the next free queue
          // number, so they must not race each other.
          for (const customer of roster) {
            await moveQueueEntry(db, customer.id, target);
          }
        } else if (roster.length > 0) {
          await deleteQueueEntriesInLot(db, lotNumber);
        }

        await deleteLotRow(db, lotNumber);
      }, "ลบล็อตไม่สำเร็จ"),
    [mutate, customersInLot],
  );

  // ---------- customer mutations ----------

  const addCustomer = useCallback(
    async (input: NewCustomerInput): MutationResult => {
      const codeError = validateCode(input.code);
      if (codeError) return codeError;
      if (!input.name.trim()) return "กรุณากรอกชื่อลูกค้า";

      return mutate(async () => {
        // `queue_number` is left to the assign_queue_number() trigger, which
        // also rejects a closed or full lot.
        await createQueueEntry(supabaseBrowser(), {
          lotNumber: lotNumberOf(input.lotId),
          code: input.code,
          name: input.name,
          commissionType: input.type,
          characterCount: input.characters,
          note: input.note,
          email: input.email,
        });
      }, "เพิ่มลูกค้าไม่สำเร็จ");
    },
    [mutate],
  );

  const moveCustomer = useCallback(
    (customerId: string, toLotId: string) =>
      mutate(async () => {
        await moveQueueEntry(supabaseBrowser(), customerId, lotNumberOf(toLotId));
      }, "ย้ายลูกค้าไม่สำเร็จ"),
    [mutate],
  );

  const removeCustomer = useCallback(
    (customerId: string) =>
      mutate(async () => {
        await deleteQueueEntry(supabaseBrowser(), customerId);
      }, "ลบลูกค้าไม่สำเร็จ"),
    [mutate],
  );

  const updateCustomer = useCallback(
    async (customerId: string, patch: CustomerPatch): MutationResult => {
      if (patch.code !== undefined) {
        const codeError = validateCode(patch.code);
        if (codeError) return codeError;
      }
      if (patch.name !== undefined && !patch.name.trim()) {
        return "กรุณากรอกชื่อลูกค้า";
      }
      if (patch.commission?.characters !== undefined && patch.commission.characters < 1) {
        return "จำนวนตัวละครต้องมากกว่า 0";
      }

      // Marking a queue paid with no amount recorded would make the trigger's
      // `payment_received` log entry read as a blank amount, so the quotation
      // total is carried over. `paid_at` stays the trigger's business.
      const customer = customers.find((entry) => entry.id === customerId);
      const amountPaid =
        patch.payment === "paid" && customer?.amount != null
          ? customer.amount
          : undefined;

      return mutate(async () => {
        await updateQueueEntry(supabaseBrowser(), customerId, {
          stage: patch.stage,
          state: patch.state,
          paymentStatus: patch.payment,
          amountPaid,
          name: patch.name,
          code: patch.code,
          contact: patch.contact,
          email: patch.email,
          commissionType: patch.commission?.type,
          characterCount: patch.commission?.characters,
          dimensions: patch.commission?.dimensions,
          note: patch.commission?.note,
        });
      }, "บันทึกข้อมูลลูกค้าไม่สำเร็จ");
    },
    [mutate, customers],
  );

  const value = useMemo<AdminStore>(
    () => ({
      lots,
      customers,
      activeLot,
      adminName,
      commissionTypes,
      loading,
      busy,
      loadError,
      filledFor,
      customersInLot,
      spaceIn,
      getCustomer,
      progressFor,
      currentQueueNumber,
      refresh: load,
      createLot,
      updateLot,
      setLotStatus,
      deleteLot,
      addCustomer,
      moveCustomer,
      removeCustomer,
      updateCustomer,
    }),
    [
      lots,
      customers,
      activeLot,
      adminName,
      commissionTypes,
      loading,
      busy,
      loadError,
      filledFor,
      customersInLot,
      spaceIn,
      getCustomer,
      progressFor,
      currentQueueNumber,
      load,
      createLot,
      updateLot,
      setLotStatus,
      deleteLot,
      addCustomer,
      moveCustomer,
      removeCustomer,
      updateCustomer,
    ],
  );

  return <AdminDataContext value={value}>{children}</AdminDataContext>;
}

export function useAdminData(): AdminStore {
  const store = useContext(AdminDataContext);
  if (!store) {
    throw new Error("useAdminData must be used inside <AdminDataProvider>");
  }
  return store;
}

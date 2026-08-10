"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { customers as seedCustomers } from "@/data/customers";
import { lots as seedLots, lotFilled, nextQueueNumber } from "@/data/lots";
import { thaiDate } from "@/lib/format";
import type { Customer, Lot, LotStatus } from "@/lib/types";

/** What happens to a lot's customers when the lot is deleted. */
export type DeleteLotPlan =
  | { kind: "reassign"; toLotId: string }
  | { kind: "delete-customers" };

export interface CreateLotInput {
  capacity: number;
  dateLabel?: string;
}

interface AdminStore {
  lots: Lot[];
  customers: Customer[];
  /** First lot still open for new queues. */
  activeLot: Lot | undefined;

  filledFor: (lotId: string) => number;
  customersInLot: (lotId: string) => Customer[];
  /** Free slots left, used to gate moves. */
  spaceIn: (lotId: string) => number;
  getCustomer: (code: string) => Customer | undefined;

  createLot: (input: CreateLotInput) => void;
  updateLot: (lotId: string, patch: Partial<Pick<Lot, "capacity">>) => void;
  setLotStatus: (lotId: string, status: LotStatus) => void;
  deleteLot: (lotId: string, plan: DeleteLotPlan) => void;

  addCustomer: (input: NewCustomerInput) => boolean;
  moveCustomer: (customerId: string, toLotId: string) => boolean;
  removeCustomer: (customerId: string) => void;
  updateCustomer: (customerId: string, patch: Partial<Customer>) => void;
}

export interface NewCustomerInput {
  name: string;
  code: string;
  lotId: string;
  type: string;
  characters: number;
  note: string;
}

const AdminDataContext = createContext<AdminStore | null>(null);

/**
 * In-memory admin state, seeded from the mock data. It lives at the /admin
 * layout so edits survive navigation between admin screens. When Supabase
 * lands, each action below becomes a mutation and this provider becomes a
 * cache — the component API stays the same.
 */
export function AdminDataProvider({ children }: { children: ReactNode }) {
  const [lots, setLots] = useState<Lot[]>(seedLots);
  const [customers, setCustomers] = useState<Customer[]>(seedCustomers);

  const filledFor = useCallback(
    (lotId: string) => lotFilled(lotId, customers),
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
      const lot = lots.find((l) => l.id === lotId);
      if (!lot) return 0;
      return Math.max(0, lot.capacity - lotFilled(lotId, customers));
    },
    [lots, customers],
  );

  const getCustomer = useCallback(
    (code: string) =>
      customers.find(
        (customer) => customer.code.toUpperCase() === code.toUpperCase(),
      ),
    [customers],
  );

  const createLot = useCallback((input: CreateLotInput) => {
    setLots((current) => {
      const number = Math.max(0, ...current.map((lot) => lot.number)) + 1;
      const lot: Lot = {
        id: `lot-${String(number).padStart(2, "0")}`,
        number,
        status: "active",
        capacity: input.capacity,
        queueRange: `คิว 01–${String(input.capacity).padStart(2, "0")}`,
        dateLabel: input.dateLabel ?? `เปิด ${thaiDate()}`,
      };
      // Only one lot takes new queues at a time, so older ones close.
      return [
        lot,
        ...current.map((existing) =>
          existing.status === "active"
            ? { ...existing, status: "closed" as const }
            : existing,
        ),
      ];
    });
  }, []);

  const updateLot = useCallback(
    (lotId: string, patch: Partial<Pick<Lot, "capacity">>) => {
      setLots((current) =>
        current.map((lot) =>
          lot.id === lotId
            ? {
                ...lot,
                ...patch,
                queueRange:
                  patch.capacity === undefined
                    ? lot.queueRange
                    : `คิว 01–${String(patch.capacity).padStart(2, "0")}`,
              }
            : lot,
        ),
      );
    },
    [],
  );

  const setLotStatus = useCallback((lotId: string, status: LotStatus) => {
    setLots((current) =>
      current.map((lot) =>
        lot.id === lotId
          ? {
              ...lot,
              status,
              dateLabel:
                status === "closed"
                  ? `ปิด ${thaiDate()}`
                  : `เปิด ${thaiDate()}`,
            }
          : lot,
      ),
    );
  }, []);

  const deleteLot = useCallback(
    (lotId: string, plan: DeleteLotPlan) => {
      const staying = customers.filter((customer) => customer.lotId !== lotId);

      if (plan.kind === "delete-customers") {
        setCustomers(staying);
      } else {
        const targetLot = lots.find((lot) => lot.id === plan.toLotId);
        const moving = customers
          .filter((customer) => customer.lotId === lotId)
          .sort((a, b) => a.queueNumber - b.queueNumber);

        // Hand each customer the next free number in the target lot.
        const merged = moving.reduce<Customer[]>((acc, customer) => {
          const queueNumber = targetLot
            ? nextQueueNumber(targetLot, acc)
            : null;
          return acc.concat({
            ...customer,
            lotId: plan.toLotId,
            queueNumber: queueNumber ?? customer.queueNumber,
          });
        }, staying);

        setCustomers(merged);
      }

      setLots((current) => current.filter((lot) => lot.id !== lotId));
    },
    [lots, customers],
  );

  const addCustomer = useCallback(
    (input: NewCustomerInput) => {
      const lot = lots.find((entry) => entry.id === input.lotId);
      if (!lot) return false;

      const queueNumber = nextQueueNumber(lot, customers);
      if (queueNumber === null) return false; // lot is full

      const code = input.code.trim().toUpperCase();
      if (customers.some((customer) => customer.code === code)) return false;

      setCustomers((current) =>
        current.concat({
          id: `c-${code.toLowerCase()}`,
          code,
          name: input.name.trim(),
          queueNumber,
          lotId: input.lotId,
          stage: "waiting",
          state: "active",
          payment: "unpaid",
          amount: null,
          commission: {
            type: input.type,
            characters: input.characters,
            dimensions: "3000 × 4000 px",
            note: input.note.trim() || "—",
          },
          sketches: [],
          stageHistory: [],
          history: [
            {
              id: "h1",
              label: "เพิ่มเข้าคิว",
              dateLabel: thaiDate(),
              tone: "amber",
            },
          ],
          quotationId: null,
          updatedLabel: thaiDate(),
        }),
      );
      return true;
    },
    [lots, customers],
  );

  const moveCustomer = useCallback(
    (customerId: string, toLotId: string) => {
      const targetLot = lots.find((lot) => lot.id === toLotId);
      if (!targetLot) return false;

      const customer = customers.find((c) => c.id === customerId);
      if (!customer || customer.lotId === toLotId) return false;

      const others = customers.filter((c) => c.id !== customerId);
      const queueNumber = nextQueueNumber(targetLot, others);
      if (queueNumber === null) return false; // lot is full

      setCustomers(
        others.concat({ ...customer, lotId: toLotId, queueNumber }),
      );
      return true;
    },
    [lots, customers],
  );

  const removeCustomer = useCallback((customerId: string) => {
    setCustomers((current) =>
      current.filter((customer) => customer.id !== customerId),
    );
  }, []);

  const updateCustomer = useCallback(
    (customerId: string, patch: Partial<Customer>) => {
      setCustomers((current) =>
        current.map((customer) =>
          customer.id === customerId ? { ...customer, ...patch } : customer,
        ),
      );
    },
    [],
  );

  const value = useMemo<AdminStore>(
    () => ({
      lots,
      customers,
      activeLot: lots.find((lot) => lot.status === "active"),
      filledFor,
      customersInLot,
      spaceIn,
      getCustomer,
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
      filledFor,
      customersInLot,
      spaceIn,
      getCustomer,
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

  return (
    <AdminDataContext value={value}>{children}</AdminDataContext>
  );
}

export function useAdminData(): AdminStore {
  const store = useContext(AdminDataContext);
  if (!store) {
    throw new Error("useAdminData must be used inside <AdminDataProvider>");
  }
  return store;
}

import type { Customer, Lot } from "@/lib/types";
import { customers as seedCustomers } from "./customers";

export const lots: Lot[] = [
  {
    id: "lot-03",
    number: 3,
    status: "active",
    capacity: 10,
    queueRange: "คิว 01–10",
    dateLabel: "เปิด 1 ส.ค. 2569",
  },
  {
    id: "lot-02",
    number: 2,
    status: "closed",
    capacity: 8,
    queueRange: "คิว 01–08",
    dateLabel: "ปิด 28 ก.ค. 2569",
  },
  {
    id: "lot-01",
    number: 1,
    status: "closed",
    capacity: 10,
    queueRange: "คิว 01–10",
    dateLabel: "ปิด 2 ก.ค. 2569",
  },
];

export const activeLot = lots[0];

export function getLot(id: string): Lot | undefined {
  return lots.find((lot) => lot.id === id);
}

/** "Lot 03" — always two digits, matching the mockup. */
export function lotLabel(lot: Pick<Lot, "number">): string {
  return `Lot ${String(lot.number).padStart(2, "0")}`;
}

/**
 * Occupied slots, derived rather than stored — customers can be moved between
 * lots, so a cached counter would drift.
 */
export function lotFilled(
  lotId: string,
  source: Customer[] = seedCustomers,
): number {
  return source.filter((customer) => customer.lotId === lotId).length;
}

/** Lowest free queue number in a lot, or null when the lot is full. */
export function nextQueueNumber(
  lot: Lot,
  source: Customer[],
): number | null {
  const taken = new Set(
    source.filter((c) => c.lotId === lot.id).map((c) => c.queueNumber),
  );
  for (let n = 1; n <= lot.capacity; n += 1) {
    if (!taken.has(n)) return n;
  }
  return null;
}

import type { Lot } from "@/lib/types";

export const lots: Lot[] = [
  {
    id: "lot-03",
    number: 3,
    status: "active",
    capacity: 10,
    filled: 7,
    queueRange: "คิว 01–10",
    dateLabel: "เปิด 1 ส.ค. 2569",
  },
  {
    id: "lot-02",
    number: 2,
    status: "closed",
    capacity: 8,
    filled: 8,
    queueRange: "คิว 01–08",
    dateLabel: "ปิด 28 ก.ค. 2569",
  },
  {
    id: "lot-01",
    number: 1,
    status: "closed",
    capacity: 10,
    filled: 10,
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

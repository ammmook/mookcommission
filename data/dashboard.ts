import type { ActionItem, Stage } from "@/lib/types";
import { customers } from "./customers";
import { activeLot } from "./lots";

export const actionItems: ActionItem[] = [
  {
    id: "a1",
    tone: "amber",
    label: "#06 Nammon รอชำระเงิน 3 วัน",
    shortLabel: "#06 รอชำระเงิน 3 วัน",
    actionLabel: "ดู",
    href: "/admin/customers/6",
  },
  {
    id: "a2",
    tone: "violet",
    label: "#07 Bright ร่างเสร็จ · ยังไม่ออกใบ",
    shortLabel: "#07 ยังไม่ออกใบเสนอราคา",
    actionLabel: "ออกใบ",
    href: "/admin/customers/7/quotation",
  },
  {
    id: "a3",
    tone: "coral",
    label: "#04 Ploy หยุดชั่วคราว 5 วัน",
    shortLabel: "#04 หยุดชั่วคราว 5 วัน",
    actionLabel: "ดู",
    href: "/admin/customers/4",
  },
];

export interface DashboardStats {
  waiting: number;
  completedThisMonth: number;
  outstandingAmount: number;
  outstandingCount: number;
  currentQueueLabel: string;
  currentQueueDetail: string;
}

export const dashboardStats: DashboardStats = {
  waiting: 8,
  completedThisMonth: 12,
  outstandingAmount: 4800,
  outstandingCount: 2,
  currentQueueLabel: "#05",
  currentQueueDetail: "Mook · กำลังลงสี",
};

/** Stage counts inside the active lot, for the breakdown bars. */
export function activeLotBreakdown(): Array<{
  label: string;
  stage: Stage | "awaiting-payment";
  count: number;
  barClass: string;
}> {
  const inLot = customers.filter(
    (c) => c.lotId === activeLot.id && c.state !== "cancelled",
  );
  const count = (predicate: (stage: Stage) => boolean) =>
    inLot.filter((c) => predicate(c.stage)).length;

  return [
    {
      label: "รอคิว",
      stage: "waiting",
      count: count((s) => s === "waiting"),
      barClass: "bg-subtle",
    },
    {
      label: "ร่างภาพ",
      stage: "sketch",
      count: count((s) => s === "sketch"),
      barClass: "bg-sky",
    },
    {
      label: "รอชำระ",
      stage: "awaiting-payment",
      count: count((s) => s === "payment"),
      barClass: "bg-amber",
    },
    {
      label: "ลงสี",
      stage: "coloring",
      count: count((s) => s === "coloring"),
      barClass: "bg-violet",
    },
    {
      label: "เสร็จสิ้น",
      stage: "completed",
      count: count((s) => s === "completed"),
      barClass: "bg-teal",
    },
  ];
}

export const todayLabel = "6 สิงหาคม 2569";

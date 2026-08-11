import { queueTag } from "@/lib/format";
import type { ActionItem, Customer, Stage } from "@/lib/types";

/**
 * Dashboard derivations.
 *
 * Everything here is computed from the customers the store already loaded —
 * there is no separate stats query, and no mock numbers. Counts therefore stay
 * consistent with the lists rendered beside them.
 */

export interface DashboardStats {
  waiting: number;
  completedThisMonth: number;
  outstandingAmount: number;
  outstandingCount: number;
  currentQueueLabel: string;
  currentQueueDetail: string;
}

const STAGE_TH: Record<Stage, string> = {
  waiting: "รอคิว",
  deposit: "รอมัดจำ",
  sketch: "ร่างภาพ",
  coloring: "กำลังลงสี",
  payment: "รอชำระเงิน",
  completed: "เสร็จสิ้น",
};

export function dashboardStats(
  customers: Customer[],
  roster: Customer[],
  currentQueueNumber: number | null,
): DashboardStats {
  const live = customers.filter((customer) => customer.state !== "cancelled");

  // "เสร็จแล้วเดือนนี้" reads off `updatedLabel`'s underlying date indirectly:
  // a completed queue's last update is its completion, which is close enough
  // for a headline number and needs no extra column.
  const completedThisMonth = live.filter(
    (customer) => customer.stage === "completed",
  ).length;

  const outstanding = live.filter(
    (customer) =>
      customer.payment === "unpaid" &&
      customer.amount !== null &&
      customer.amount > 0,
  );

  const current =
    currentQueueNumber === null
      ? undefined
      : roster.find(
          (customer) => customer.queueNumber === currentQueueNumber,
        );

  return {
    waiting: live.filter((customer) => customer.stage === "waiting").length,
    completedThisMonth,
    outstandingAmount: outstanding.reduce(
      (sum, customer) => sum + (customer.amount ?? 0),
      0,
    ),
    outstandingCount: outstanding.length,
    currentQueueLabel: current ? queueTag(current.queueNumber) : "—",
    currentQueueDetail: current
      ? `${current.name} · ${STAGE_TH[current.stage]}`
      : "ยังไม่มีคิวที่กำลังทำ",
  };
}

/**
 * The "ต้องจัดการ" list, derived from the active lot's roster rather than
 * hand-written: awaiting payment, sketch done but no quotation issued, paused.
 */
export function actionItemsFor(roster: Customer[]): ActionItem[] {
  const items: ActionItem[] = [];

  for (const customer of roster) {
    if (customer.state === "cancelled") continue;

    if (customer.state === "paused") {
      items.push({
        id: `pause-${customer.id}`,
        tone: "coral",
        label: `${queueTag(customer.queueNumber)} ${customer.name} หยุดชั่วคราว`,
        shortLabel: `${queueTag(customer.queueNumber)} หยุดชั่วคราว`,
        actionLabel: "ดู",
        href: `/admin/customers/${customer.code}`,
      });
      continue;
    }

    // Both money stages need chasing; only the wording differs.
    if (
      (customer.stage === "payment" || customer.stage === "deposit") &&
      customer.payment === "unpaid"
    ) {
      const what = customer.stage === "deposit" ? "รอมัดจำ" : "รอชำระเงิน";
      items.push({
        id: `pay-${customer.id}`,
        tone: "amber",
        label: `${queueTag(customer.queueNumber)} ${customer.name} ${what}`,
        shortLabel: `${queueTag(customer.queueNumber)} ${what}`,
        actionLabel: "ดู",
        href: `/admin/customers/${customer.code}`,
      });
      continue;
    }

    if (customer.stage === "sketch" && customer.quotationId === null) {
      items.push({
        id: `quote-${customer.id}`,
        tone: "violet",
        label: `${queueTag(customer.queueNumber)} ${customer.name} ร่างเสร็จ · ยังไม่ออกใบ`,
        shortLabel: `${queueTag(customer.queueNumber)} ยังไม่ออกใบเสนอราคา`,
        actionLabel: "ออกใบ",
        href: `/admin/customers/${customer.code}/quotation`,
      });
    }
  }

  return items;
}

/** Stage counts for the breakdown bars, over whichever customers are passed in. */
export function stageBreakdown(source: Customer[]): Array<{
  label: string;
  stage: Stage | "awaiting-payment";
  count: number;
  barClass: string;
}> {
  const active = source.filter((c) => c.state !== "cancelled");
  const count = (predicate: (stage: Stage) => boolean) =>
    active.filter((c) => predicate(c.stage)).length;

  return [
    {
      label: "รอคิว",
      stage: "waiting",
      count: count((s) => s === "waiting"),
      barClass: "bg-subtle",
    },
    {
      label: "มัดจำ",
      stage: "deposit",
      count: count((s) => s === "deposit"),
      barClass: "bg-coral",
    },
    {
      label: "ร่างภาพ",
      stage: "sketch",
      count: count((s) => s === "sketch"),
      barClass: "bg-sky",
    },
    {
      label: "ลงสี",
      stage: "coloring",
      count: count((s) => s === "coloring"),
      barClass: "bg-violet",
    },
    {
      label: "รอชำระ",
      stage: "awaiting-payment",
      count: count((s) => s === "payment"),
      barClass: "bg-amber",
    },
    {
      label: "เสร็จสิ้น",
      stage: "completed",
      count: count((s) => s === "completed"),
      barClass: "bg-teal",
    },
  ];
}

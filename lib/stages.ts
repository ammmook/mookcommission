import type { PaymentStatus, QueueState, Stage } from "./types";

/** Tailwind class bundles per tone, so status colours stay in one place. */
export interface ToneClasses {
  /** Pill background + text, used by Badge/StatusPill. */
  pill: string;
  /** Solid dot colour. */
  dot: string;
  /** Solid fill for progress bars and step markers. */
  fill: string;
}

export interface StageMeta {
  stage: Stage;
  th: string;
  en: string;
  tone: ToneClasses;
}

const neutralTone: ToneClasses = {
  pill: "bg-stone-bg text-stone-text",
  dot: "bg-subtle",
  fill: "bg-subtle",
};

export const STAGE_META: Record<Stage, StageMeta> = {
  waiting: {
    stage: "waiting",
    th: "รอคิว",
    en: "WAITING",
    tone: neutralTone,
  },
  deposit: {
    stage: "deposit",
    th: "จ่ายมัดจำ",
    en: "DEPOSIT",
    tone: {
      pill: "bg-coral-bg text-coral-text",
      dot: "bg-coral",
      fill: "bg-coral",
    },
  },
  sketch: {
    stage: "sketch",
    th: "ร่างภาพ",
    en: "SKETCH",
    tone: {
      pill: "bg-sky-bg text-sky-text",
      dot: "bg-sky",
      fill: "bg-sky",
    },
  },
  payment: {
    stage: "payment",
    th: "ชำระเงิน",
    en: "PAYMENT",
    tone: {
      pill: "bg-amber-bg text-amber-text",
      dot: "bg-amber",
      fill: "bg-amber",
    },
  },
  coloring: {
    stage: "coloring",
    th: "กำลังลงสี",
    en: "COLORING",
    tone: {
      pill: "bg-violet-bg text-violet-text",
      dot: "bg-violet",
      fill: "bg-violet",
    },
  },
  completed: {
    stage: "completed",
    th: "เสร็จสิ้น",
    en: "COMPLETED",
    tone: {
      pill: "bg-teal-bg text-teal-text",
      dot: "bg-teal",
      fill: "bg-teal",
    },
  },
};

/** Ordered list — drives steppers and "how far along" calculations. */
export const STAGE_ORDER: Stage[] = [
  "waiting",
  "deposit",
  "sketch",
  "coloring",
  "payment",
  "completed",
];

export function stageIndex(stage: Stage): number {
  return STAGE_ORDER.indexOf(stage);
}

/**
 * A customer whose queue is waiting for money shows what is owed rather than
 * the bare stage name — the mockup's customer table does this for #06.
 */
export function stageLabel(stage: Stage, payment: PaymentStatus): string {
  if (payment === "unpaid") {
    if (stage === "deposit") return "รอมัดจำ";
    if (stage === "payment") return "รอชำระเงิน";
  }
  return STAGE_META[stage].th;
}

export const STATE_META: Record<
  Exclude<QueueState, "active">,
  { th: string; en: string; tone: ToneClasses }
> = {
  paused: {
    th: "หยุดชั่วคราว",
    en: "PAUSED",
    tone: {
      pill: "bg-amber-bg text-amber-text",
      dot: "bg-amber",
      fill: "bg-amber",
    },
  },
  cancelled: {
    th: "ยกเลิกแล้ว",
    en: "CANCELLED",
    tone: neutralTone,
  },
};

export const PAYMENT_META: Record<
  PaymentStatus,
  { th: string; tone: ToneClasses }
> = {
  paid: {
    th: "ชำระแล้ว",
    tone: {
      pill: "bg-teal-bg text-teal-text",
      dot: "bg-teal",
      fill: "bg-teal",
    },
  },
  unpaid: {
    th: "ยังไม่ชำระ",
    tone: {
      pill: "bg-amber-bg text-amber-text",
      dot: "bg-amber",
      fill: "bg-amber",
    },
  },
};

/** Left accent stripe on customer cards / lot cards. */
export function accentBorderClass(
  stage: Stage,
  state: QueueState,
): string {
  if (state === "cancelled") return "border-l-ghost";
  if (state === "paused") return "border-l-amber";
  switch (stage) {
    case "coloring":
      return "border-l-violet";
    case "sketch":
      return "border-l-sky";
    case "deposit":
      return "border-l-coral";
    case "payment":
      return "border-l-amber";
    case "completed":
      return "border-l-teal";
    default:
      return "border-l-ghost";
  }
}

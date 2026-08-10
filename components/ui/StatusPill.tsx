import { Badge } from "./Badge";
import { PAYMENT_META, STAGE_META, STATE_META, stageLabel } from "@/lib/stages";
import type { Customer } from "@/lib/types";

/**
 * The stage badge as it appears in lists: paused/cancelled override the stage,
 * matching rows #04 and #09 in the mockup's customer table.
 */
export function StagePill({ customer }: { customer: Customer }) {
  if (customer.state === "cancelled") {
    const meta = STATE_META.cancelled;
    return <Badge toneClass={meta.tone.pill}>✕ {meta.th}</Badge>;
  }
  if (customer.state === "paused") {
    const meta = STATE_META.paused;
    return <Badge toneClass={meta.tone.pill}>⏸ {meta.th}</Badge>;
  }
  if (customer.stage === "completed") {
    return <Badge toneClass={STAGE_META.completed.tone.pill}>✓ เสร็จสิ้น</Badge>;
  }
  const meta = STAGE_META[customer.stage];
  return (
    <Badge toneClass={meta.tone.pill} dotClass={meta.tone.dot}>
      {stageLabel(customer.stage, customer.payment)}
    </Badge>
  );
}

export function PaymentPill({ customer }: { customer: Customer }) {
  if (customer.state === "cancelled") {
    return <span className="text-xs text-subtle">—</span>;
  }
  const meta = PAYMENT_META[customer.payment];
  if (customer.payment === "unpaid") {
    return <Badge toneClass={meta.tone.pill}>⏳ {meta.th}</Badge>;
  }
  return (
    <Badge toneClass={meta.tone.pill} dotClass={meta.tone.dot}>
      {meta.th}
    </Badge>
  );
}

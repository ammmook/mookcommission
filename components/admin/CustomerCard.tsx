import Link from "next/link";
import { lotLabel } from "@/data/lots";
import { PaymentPill, StagePill } from "@/components/ui/StatusPill";
import { accentBorderClass } from "@/lib/stages";
import { cn } from "@/lib/cn";
import { queueTag } from "@/lib/format";
import type { Customer, Lot } from "@/lib/types";

/** Phone/tablet representation of a customer row. */
export function CustomerCard({
  customer,
  lot,
  isCurrent,
}: {
  customer: Customer;
  lot: Lot | undefined;
  isCurrent: boolean;
}) {
  const cancelled = customer.state === "cancelled";

  return (
    <Link
      href={`/admin/customers/${customer.code}`}
      className={cn(
        "block rounded-card border-[1.5px] border-l-5 border-line bg-surface p-4 transition-shadow hover:shadow-[0_4px_14px_rgba(43,35,64,.08)]",
        accentBorderClass(customer.stage, customer.state),
        cancelled && "bg-[#FBF8F4] opacity-70",
      )}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "font-display text-xl font-bold",
            cancelled ? "text-subtle line-through" : "text-ink",
          )}
        >
          {queueTag(customer.queueNumber)}
        </span>
        <span className="min-w-0 flex-1">
          <strong
            className={cn(
              "block truncate font-display text-sm font-semibold",
              cancelled ? "text-body" : "text-ink",
            )}
          >
            {customer.name}
          </strong>
          <span className="font-mono text-[11px] font-medium text-subtle">
            {customer.code} · {lot ? lotLabel(lot).toUpperCase() : ""}
          </span>
        </span>
        {isCurrent ? (
          <span className="shrink-0 rounded-full bg-violet-bg px-2 py-1 font-mono text-[9.5px] font-medium text-violet">
            NOW
          </span>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <StagePill customer={customer} />
        {!cancelled ? <PaymentPill customer={customer} /> : null}
      </div>
    </Link>
  );
}

import { lotLabel } from "@/data/lots";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { cn } from "@/lib/cn";
import type { Lot } from "@/lib/types";

export function LotCard({ lot }: { lot: Lot }) {
  const active = lot.status === "active";

  return (
    <article
      className={cn(
        "rounded-card border-[1.5px] border-l-5 border-line bg-surface p-4 sm:px-4.5",
        active ? "border-l-teal" : "border-l-ghost",
      )}
    >
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
        <h3
          className={cn(
            "text-[15px] font-semibold sm:text-base",
            active ? "text-ink" : "text-body",
          )}
        >
          {lotLabel(lot)}
        </h3>
        {active ? (
          <Badge mono toneClass="bg-teal-bg text-teal-text" dotClass="bg-teal">
            ACTIVE
          </Badge>
        ) : (
          <Badge mono>CLOSED</Badge>
        )}
        <span
          className={cn(
            "ml-auto font-mono text-xs font-medium",
            active ? "text-body" : "text-subtle",
          )}
        >
          {lot.filled} / {lot.capacity}
        </span>
      </div>

      <p className="mt-2 mb-2.5 text-xs text-subtle">
        {lot.queueRange} · {lot.dateLabel}
      </p>

      <ProgressBar
        value={lot.filled}
        total={lot.capacity}
        label={`ความคืบหน้า ${lotLabel(lot)}`}
        fillClass={active ? "bg-linear-to-r from-teal to-sky" : "bg-ghost"}
      />
    </article>
  );
}

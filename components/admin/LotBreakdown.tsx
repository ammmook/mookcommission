import { stageBreakdown } from "@/data/dashboard";
import { percent } from "@/lib/format";
import type { Customer } from "@/lib/types";

/** Horizontal bars showing how a lot is distributed across stages. */
export function LotBreakdown({ customers }: { customers: Customer[] }) {
  const rows = stageBreakdown(customers);
  const max = Math.max(1, ...rows.map((row) => row.count));

  return (
    <dl className="flex flex-col gap-2.5 rounded-card border-[1.5px] border-line bg-surface p-4 sm:px-4.5">
      {rows.map((row) => (
        <div key={row.stage} className="flex items-center gap-2.5">
          <dt className="w-16 shrink-0 text-xs text-body sm:w-19.5">
            {row.label}
          </dt>
          <span
            aria-hidden="true"
            className="h-2.25 min-w-0 flex-1 overflow-hidden rounded-full bg-line"
          >
            <span
              className={`block h-full rounded-full ${row.barClass}`}
              style={{ width: `${percent(row.count, max)}%` }}
            />
          </span>
          <dd className="w-4 shrink-0 text-right font-mono text-[11.5px] font-semibold text-ink">
            {row.count}
          </dd>
        </div>
      ))}
    </dl>
  );
}

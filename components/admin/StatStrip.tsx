import { cn } from "@/lib/cn";

export interface Stat {
  id: string;
  /** Mono uppercase eyebrow, e.g. "ACTIVE LOT". */
  eyebrow: string;
  value: string;
  detail?: string;
  valueClass?: string;
}

/**
 * Dark summary panel (option 2d-A, "stat strip"). It reflows from a 2-up grid
 * on phones to a single divided row on large screens.
 */
export function StatStrip({ stats }: { stats: Stat[] }) {
  return (
    <section className="rounded-card bg-nav p-4 sm:p-5 lg:px-6">
      <dl className="grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-3 lg:flex lg:gap-0">
        {stats.map((stat, index) => (
          <div
            key={stat.id}
            className={cn(
              "flex min-w-0 flex-col gap-0.5 lg:flex-1 lg:px-5",
              index > 0 && "lg:border-l lg:border-white/14",
              index === 0 && "lg:pl-0",
              index === stats.length - 1 && "lg:pr-0",
            )}
          >
            <dt className="font-mono text-[9.5px] font-medium text-nav-mono sm:text-[10px]">
              {stat.eyebrow}
            </dt>
            <dd
              className={cn(
                "truncate font-display text-[22px] leading-tight font-bold text-white sm:text-2xl lg:text-[28px]",
                stat.valueClass,
              )}
            >
              {stat.value}
            </dd>
            {stat.detail ? (
              <dd className="truncate text-[11px] text-nav-text">
                {stat.detail}
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
    </section>
  );
}

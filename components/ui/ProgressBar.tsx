import { cn } from "@/lib/cn";
import { percent } from "@/lib/format";

interface ProgressBarProps {
  value: number;
  total: number;
  /** Tailwind background class for the filled portion. */
  fillClass?: string;
  /** Track height; the mockup uses 7–9px depending on context. */
  size?: "sm" | "md";
  label: string;
  className?: string;
}

export function ProgressBar({
  value,
  total,
  fillClass = "bg-linear-to-r from-teal to-sky",
  size = "md",
  label,
  className,
}: ProgressBarProps) {
  const pct = percent(value, total);
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-label={label}
      className={cn(
        "overflow-hidden rounded-full bg-line",
        size === "sm" ? "h-[7px]" : "h-2",
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width]", fillClass)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

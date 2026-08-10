import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface EmptyStateProps {
  /** Illustration slot — usually an ArtPlaceholder or a large emoji tile. */
  visual?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
  dashed?: boolean;
}

export function EmptyState({
  visual,
  title,
  description,
  action,
  className,
  dashed,
}: EmptyStateProps) {
  return (
    <section
      className={cn(
        "rounded-card bg-surface px-5 py-7 text-center sm:px-6 sm:py-8",
        dashed
          ? "border-[1.5px] border-dashed border-line-dashed"
          : "border-[1.5px] border-line",
        className,
      )}
    >
      {visual ? <div className="mb-4 flex justify-center">{visual}</div> : null}
      <h2 className="text-lg font-bold text-ink sm:text-xl">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-[12.5px] leading-relaxed text-body">
        {description}
      </p>
      {action ? <div className="mt-4.5">{action}</div> : null}
    </section>
  );
}

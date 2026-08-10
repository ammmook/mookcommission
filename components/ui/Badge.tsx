import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface BadgeProps {
  children: ReactNode;
  /** Tailwind classes for background + text, usually from `lib/stages`. */
  toneClass?: string;
  /** Renders the small leading status dot. */
  dotClass?: string;
  /** Uppercase mono treatment, e.g. "ACTIVE" / "DRAFT". */
  mono?: boolean;
  className?: string;
}

export function Badge({
  children,
  toneClass = "bg-stone-bg text-stone-text",
  dotClass,
  mono,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1",
        mono
          ? "font-mono text-[10px] font-semibold tracking-wide"
          : "text-[11px] font-semibold sm:text-[11.5px]",
        toneClass,
        className,
      )}
    >
      {dotClass ? (
        <span
          aria-hidden="true"
          className={cn("size-[7px] rounded-full", dotClass)}
        />
      ) : null}
      {children}
    </span>
  );
}

import type { ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

interface CardProps {
  as?: ElementType;
  children: ReactNode;
  className?: string;
  /** Drops the default padding so callers can control it (e.g. tables). */
  bare?: boolean;
}

/** White panel with the cream hairline border used across every screen. */
export function Card({ as: Tag = "section", children, className, bare }: CardProps) {
  return (
    <Tag
      className={cn(
        "rounded-card border-[1.5px] border-line bg-surface",
        !bare && "p-4 sm:p-5 lg:p-6",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  title: ReactNode;
  /** Small grey suffix, e.g. "/ Process". */
  hint?: ReactNode;
  action?: ReactNode;
  className?: string;
  headingLevel?: 2 | 3;
}

export function CardHeader({
  title,
  hint,
  action,
  className,
  headingLevel = 2,
}: CardHeaderProps) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  return (
    <div
      className={cn(
        "mb-3 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-2 sm:mb-4",
        className,
      )}
    >
      <Heading className="text-[15px] font-semibold text-ink sm:text-base">
        {title}
        {hint ? (
          <span className="ml-1.5 font-sans text-[11px] font-normal text-subtle">
            {hint}
          </span>
        ) : null}
      </Heading>
      {action}
    </div>
  );
}

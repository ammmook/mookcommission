"use client";

import { cn } from "@/lib/cn";

export interface Segment {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for the group, e.g. "กรองตาม Lot". */
  label: string;
  /** Stretch each segment to fill the track — better on narrow screens. */
  stretch?: boolean;
  className?: string;
}

export function SegmentedControl({
  segments,
  value,
  onChange,
  label,
  stretch,
  className,
}: SegmentedControlProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        "flex rounded-xl bg-[#F1EBE2] p-[3px]",
        // Scrolls instead of squashing when there are more segments than room.
        !stretch && "max-w-full overflow-x-auto",
        className,
      )}
    >
      {segments.map((segment) => {
        const active = segment.value === value;
        return (
          <button
            key={segment.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(segment.value)}
            className={cn(
              "min-h-10 shrink-0 cursor-pointer rounded-[10px] px-3.5 text-[12.5px] whitespace-nowrap transition-colors",
              stretch && "flex-1 px-1",
              active
                ? "bg-white font-display font-semibold text-ink shadow-[0_1px_3px_rgba(43,35,64,.12)]"
                : "font-medium text-body hover:text-ink",
            )}
          >
            {segment.label}
          </button>
        );
      })}
    </div>
  );
}

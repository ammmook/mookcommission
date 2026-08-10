import { cn } from "@/lib/cn";

interface QueueDotsProps {
  /** Total slots in the lot. */
  capacity: number;
  /** How many slots are finished. */
  done: number;
  /** Slot currently being worked on (1-based); highlighted with a ring. */
  current: number;
  size?: "sm" | "md";
}

/**
 * Queue position visual, direction 2a from the mockups: a row of dots where
 * completed slots are teal, the active slot is a larger amber dot with a halo,
 * and upcoming slots are dimmed. Wraps rather than overflowing on narrow phones.
 */
export function QueueDots({
  capacity,
  done,
  current,
  size = "md",
}: QueueDotsProps) {
  const dot = size === "sm" ? "size-3" : "size-3 sm:size-[15px]";
  const activeDot = size === "sm" ? "size-5" : "size-5 sm:size-6";

  return (
    <ul className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
      {Array.from({ length: capacity }, (_, index) => {
        const slot = index + 1;
        const isCurrent = slot === current;
        const isDone = slot <= done;
        return (
          <li
            key={slot}
            aria-hidden="true"
            className={cn(
              "rounded-full",
              isCurrent
                ? `${activeDot} bg-amber shadow-[0_0_0_5px_rgba(255,176,32,.22)] sm:shadow-[0_0_0_6px_rgba(255,176,32,.22)]`
                : `${dot} ${isDone ? "bg-teal" : "bg-white/20"}`,
            )}
          />
        );
      })}
    </ul>
  );
}

import { STAGE_META, STAGE_ORDER, stageIndex } from "@/lib/stages";
import { cn } from "@/lib/cn";
import type { Stage, StageEvent } from "@/lib/types";

interface QueueStepperProps {
  current: Stage;
  /** Dates for the stages already passed; shown on the phone timeline. */
  history?: StageEvent[];
}

/**
 * One list rendered two ways: a vertical timeline on phones and a horizontal
 * stepper from `md`, matching the desktop/mobile pair in mockup 1b.
 */
export function QueueStepper({ current, history = [] }: QueueStepperProps) {
  const currentIndex = stageIndex(current);
  const dateFor = (stage: Stage) =>
    history.find((event) => event.stage === stage)?.dateLabel;

  return (
    <ol className="flex flex-col md:flex-row md:items-start">
      {STAGE_ORDER.map((stage, index) => {
        const meta = STAGE_META[stage];
        const done = index < currentIndex;
        const active = index === currentIndex;
        const isLast = index === STAGE_ORDER.length - 1;

        return (
          <li
            key={stage}
            className="relative flex gap-3 md:min-w-0 md:flex-1 md:flex-col md:items-center md:gap-1.5"
          >
            {/* Horizontal connectors (md+): one on each side of the marker. */}
            {index > 0 ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-3.5 -left-1/2 hidden h-[3px] w-full md:block",
                  done || active ? "bg-teal" : "bg-line-strong",
                )}
              />
            ) : null}
            {!isLast ? (
              <span
                aria-hidden="true"
                className={cn(
                  "absolute top-3.5 left-1/2 hidden h-[3px] w-full md:block",
                  done ? "bg-teal" : "bg-line-strong",
                )}
              />
            ) : null}

            {/* Marker column — carries the vertical connector on phones. */}
            <span className="flex flex-col items-center md:contents">
              <StageMarker done={done} active={active} />
              {!isLast ? (
                <span
                  aria-hidden="true"
                  className={cn(
                    "w-[3px] flex-1 md:hidden",
                    done ? "bg-teal" : "bg-line-strong",
                  )}
                />
              ) : null}
            </span>

            <span
              className={cn(
                "pb-3.5 md:flex md:flex-col md:items-center md:pb-0",
                isLast && "pb-0",
              )}
            >
              <span
                className={cn(
                  "block font-display text-[13px] font-semibold md:text-[12.5px]",
                  active
                    ? "text-violet"
                    : done
                      ? "text-ink"
                      : "text-faint",
                )}
              >
                {meta.th}
              </span>
              <span
                className={cn(
                  "font-mono text-[9px] font-medium md:mt-0.5",
                  active ? "text-violet" : "text-subtle",
                )}
              >
                {active ? `${meta.en} · NOW` : meta.en}
              </span>
              {dateFor(stage) ? (
                <span className="block text-[11px] text-subtle md:hidden">
                  {dateFor(stage)}
                </span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function StageMarker({ done, active }: { done: boolean; active: boolean }) {
  if (done) {
    return (
      <span className="z-1 grid size-5.5 shrink-0 place-items-center rounded-full bg-teal text-[11px] font-bold text-white md:size-7 md:text-[13px]">
        ✓
      </span>
    );
  }
  if (active) {
    return (
      <span
        aria-hidden="true"
        className="z-1 size-5.5 shrink-0 rounded-full bg-violet animate-pulse-ring md:size-7"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="z-1 size-5.5 shrink-0 rounded-full border-[3px] border-line-strong bg-white md:size-7"
    />
  );
}

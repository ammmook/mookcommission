"use client";

import { STAGE_META, STAGE_ORDER, stageIndex } from "@/lib/stages";
import { cn } from "@/lib/cn";
import type { Stage } from "@/lib/types";

interface StageSelectorProps {
  value: Stage;
  onChange: (stage: Stage) => void;
}

/**
 * Stage picker: one per row on phones, then two and three across, and the full
 * six-across row once there is width for it. Stages before the selected one
 * read as done, matching mockup 1h.
 */
export function StageSelector({ value, onChange }: StageSelectorProps) {
  const currentIndex = stageIndex(value);

  return (
    <div
      role="group"
      aria-label="เลือกขั้นตอนงาน"
      className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6"
    >
      {STAGE_ORDER.map((stage) => {
        const index = stageIndex(stage);
        const done = index < currentIndex;
        const active = index === currentIndex;
        const meta = STAGE_META[stage];

        return (
          <button
            key={stage}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(stage)}
            className={cn(
              "flex min-h-11 flex-1 cursor-pointer items-center gap-2.5 rounded-xl border-[1.5px] px-3.5 py-3 transition-colors",
              // Icon beside the label while the cells are wide; stacked and
              // centred once six of them share a row.
              "xl:min-w-0 xl:flex-col xl:justify-center xl:gap-1.5 xl:px-2 xl:text-center",
              active &&
                "border-violet-deep bg-violet shadow-[0_4px_12px_rgba(124,107,245,.32)]",
              !active &&
                done &&
                "border-teal-border bg-teal-bg hover:bg-teal-bg/70",
              !active &&
                !done &&
                "border-line bg-surface-muted hover:border-line-strong",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "grid size-4.5 shrink-0 place-items-center rounded-full text-[9px] font-bold xl:size-5 xl:text-[10px]",
                active && "bg-white",
                !active && done && "bg-teal text-white",
                !active && !done && "border-[2.5px] border-line-strong bg-white",
              )}
            >
              {!active && done ? "✓" : ""}
            </span>
            <span
              className={cn(
                "font-display text-[13px] font-semibold xl:truncate xl:text-xs",
                active && "text-white",
                !active && done && "text-teal-text",
                !active && !done && "text-faint",
              )}
            >
              {meta.th}
            </span>
            {active ? (
              <span className="ml-auto font-mono text-[9.5px] text-white/80 xl:hidden">
                NOW
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

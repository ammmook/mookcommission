import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ActionItem } from "@/lib/types";

const toneClasses: Record<ActionItem["tone"], string> = {
  amber: "border-amber-border bg-amber-bg text-amber-text",
  violet: "border-violet-border bg-violet-bg text-violet-text",
  coral: "border-coral-border bg-coral-bg text-coral-text",
};

const dotClasses: Record<ActionItem["tone"], string> = {
  amber: "bg-amber",
  violet: "bg-violet",
  coral: "bg-coral",
};

/** "ต้องจัดการ" list — each row is a whole tap target on phones. */
export function ActionItemList({ items }: { items: ActionItem[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className={`flex min-h-12 items-center gap-2.5 rounded-2xl border-[1.5px] px-4 py-3 text-[12.5px] font-medium transition-opacity hover:opacity-85 ${toneClasses[item.tone]}`}
          >
            <span
              aria-hidden="true"
              className={`size-2.5 shrink-0 rounded-full ${dotClasses[item.tone]}`}
            />
            <span className="min-w-0 flex-1">
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">{item.shortLabel}</span>
            </span>
            <span className="hidden shrink-0 font-display text-[11.5px] font-semibold sm:inline">
              {item.actionLabel}
            </span>
            <ChevronRight size={15} aria-hidden="true" className="shrink-0" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

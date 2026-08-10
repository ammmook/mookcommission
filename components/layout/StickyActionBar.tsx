import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Bottom-anchored action bar for phone layouts. On `md` and up the actions live
 * in the page header instead, so this collapses away.
 */
export function StickyActionBar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 mt-4 flex gap-2.5 border-t-[1.5px] border-line bg-cream/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-sm sm:-mx-6 sm:px-6 md:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

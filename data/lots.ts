import type { Lot } from "@/lib/types";

/**
 * Lot display helpers.
 *
 * The mock lot list that used to live here is gone — lots now come from
 * Supabase via `lib/supabase/lots.ts`. What remains is the formatting the UI
 * shares, which has no business being in a query module.
 */

/** "Lot 03" — always two digits, matching the mockup. */
export function lotLabel(lot: Pick<Lot, "number">): string {
  return `Lot ${String(lot.number).padStart(2, "0")}`;
}

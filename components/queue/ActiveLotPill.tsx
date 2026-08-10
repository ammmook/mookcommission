import { getActiveLot } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { supabasePublic } from "@/lib/supabase/server";

/**
 * "Lot 03 กำลังเปิดรับ · 7/10 คิว" on the landing page.
 *
 * Reads `get_active_lot()` — one of the three functions granted to `anon`.
 * Customers never touch `lots` or `queue_entries` directly.
 */
export async function ActiveLotPill() {
  let label = "ยังไม่มีล็อตที่เปิดรับคิว";

  if (isSupabaseConfigured) {
    // Outside the try: `supabasePublic()` awaits `connection()`, which bails out
    // of prerendering by throwing. Catching that would swallow the signal and
    // bake this pill into the static shell.
    const db = await supabasePublic();

    try {
      const lot = await getActiveLot(db);
      if (lot) {
        label = `Lot ${String(lot.lotNumber).padStart(2, "0")} กำลังเปิดรับ · ${lot.totalEntries}/${lot.capacity} คิว`;
      }
    } catch (error) {
      // The pill is decorative; a failure here must not take down the page the
      // customer came to search from.
      console.error("[torqueue] active lot lookup failed", error);
      label = "ตรวจสอบสถานะล็อตไม่ได้ตอนนี้";
    }
  }

  return (
    <p className="inline-flex items-center gap-2 rounded-full bg-coral-tint px-3 py-1.5 text-[11px] font-semibold text-coral-deep sm:text-[11.5px]">
      <span aria-hidden="true" className="size-1.5 rounded-full bg-teal" />
      {label}
    </p>
  );
}

/** Same shape, shown while the pill's query is in flight. */
export function ActiveLotPillSkeleton() {
  return (
    <p
      aria-hidden="true"
      className="inline-flex items-center gap-2 rounded-full bg-coral-tint px-3 py-1.5 text-[11px] font-semibold text-transparent sm:text-[11.5px]"
    >
      <span className="size-1.5 rounded-full bg-coral-tint" />
      กำลังตรวจสอบสถานะล็อต
    </p>
  );
}

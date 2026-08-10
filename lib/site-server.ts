import { cache } from "react";
import { FALLBACK_SITE } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getPublicSiteSettings } from "@/lib/supabase/settings";
import { supabasePublic } from "@/lib/supabase/server";
import type { SiteSettings } from "@/lib/types";

/**
 * Reads the studio name and contact handle for the current request.
 *
 * `cache()` dedupes across the root layout and `generateMetadata`, so one
 * render makes one RPC call rather than one per consumer. Any failure falls
 * back to the built-in name — the brand is never a reason for a page to break.
 */
export const loadSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured) return FALLBACK_SITE;

  // Outside the try: `supabasePublic()` awaits `connection()`, which opts the
  // request out of prerendering by throwing. Catching that would swallow the
  // signal and freeze the studio name into the static shell.
  const db = await supabasePublic();

  try {
    return (await getPublicSiteSettings(db)) ?? FALLBACK_SITE;
  } catch (error) {
    console.error("[torqueue] site settings lookup failed", error);
    return FALLBACK_SITE;
  }
});
